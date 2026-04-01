import { prisma } from "@nebula/database";
import { env } from "@/config/env";
import bcrypt from "bcryptjs";
import { signAccessToken } from "@/lib/auth";
import {
  type RegisterData,
  type SigninData,
  type GoogleAuthData,
  type ChangePasswordData,
} from "@/lib/validations";
import HttpException, {
  UnauthorizedException,
  NotFoundException,
} from "../utils/http-exception";
import { RESPONSE_CODE, User, AuthResponse, UserProfile, UserProfileResponse, UserRole } from "@/types";
import { emailService } from "./email.service";
import { uploadService } from "./upload.service";
import crypto from "crypto";

export class AuthService {
// --- generateAccessToken moved to signup/signin calls, or kept as wrapper ---

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async register(data: RegisterData): Promise<{ user: Partial<User> }> {
    const { email, password, firstName, lastName, role } = data;
    const fullName = `${firstName} ${lastName}`.trim();

    const existingUser = await this.findUserByEmail(email);
    if (existingUser) {
      throw new HttpException(
        RESPONSE_CODE.USER_ALREADY_EXIST,
        "An account with this email already exists",
        400,
      );
    }

    const hashedPassword = await this.hashPassword(password);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        firstName,
        lastName,
        fullName,
        role,
        status: "PENDING",
        verificationToken,
        verificationTokenExpires,
      } as any,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        fullName: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Send verification email
    const baseUrl = env.NEXTAUTH_URL || "http://localhost:3000";
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

    await emailService.sendVerificationEmail(
      email,
      firstName || "Nebula User",
      verificationUrl,
    );


    return { user: user as any as User };
  }

  async signin(data: SigninData): Promise<{ accessToken: string; user: Partial<User> }> {
    const { email, password } = data;

    const user = await this.findUserByEmail(email);
    if (!user || !user.hashedPassword) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const isValidPassword = await this.verifyPassword(
      password,
      user.hashedPassword,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (user.status === "PENDING") {
      throw new UnauthorizedException(
        "Please verify your email address to sign in",
      );
    }

    if (user.status === "SUSPENDED" || user.status === "INACTIVE") {
      throw new UnauthorizedException("Your account is not active");
    }

    const accessToken = signAccessToken({ userId: user.id, type: "access" });
    const { hashedPassword, verificationToken, ...userWithoutPassword } = user;
    void hashedPassword;
    void verificationToken;
    return { accessToken, user: userWithoutPassword as any as User };
  }

  async verifyEmail(token: string): Promise<{ user: Partial<User> }> {
    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new HttpException(
        RESPONSE_CODE.VALIDATION_ERROR,
        "Invalid or expired verification token",
        400,
      );
    }

    if (
      user.verificationTokenExpires &&
      user.verificationTokenExpires < new Date()
    ) {
      throw new HttpException(
        RESPONSE_CODE.VALIDATION_ERROR,
        "Verification token has expired",
        400,
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        status: "ACTIVE",
        emailVerified: new Date(),
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });

    const { hashedPassword, verificationToken, ...userWithoutPassword } = updatedUser;
    void hashedPassword;
    void verificationToken;

    return { user: userWithoutPassword as any as User };
  }

  async googleAuth(data: GoogleAuthData): Promise<{ accessToken: string; user: Partial<User> }> {
    let { googleId, email, fullName, firstName, lastName, role, avatarUrl } = data;

    if ((!firstName || !lastName) && fullName) {
      const parts = fullName.trim().split(/\s+/);
      firstName = firstName || parts[0] || "";
      lastName = lastName || parts.slice(1).join(" ") || "";
    }

    if (!fullName && firstName && lastName) {
      fullName = `${firstName} ${lastName}`.trim();
    }

    let user = await this.findUserByGoogleId(googleId);

    if (user) {
      const accessToken = signAccessToken({ userId: user.id, type: "access" });
      const { hashedPassword, verificationToken, ...userWithoutPassword } = user;
      void hashedPassword;
      void verificationToken;
      return { accessToken, user: userWithoutPassword as any as User };
    }

    user = await this.findUserByEmail(email);
    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId, avatarUrl },
        include: {
          coach: true,
          student: true,
        },
      });

      const accessToken = signAccessToken({ userId: user.id, type: "access" });
      const { hashedPassword, verificationToken, ...userWithoutPassword } = user;
      void hashedPassword;
      void verificationToken;
      return { accessToken, user: userWithoutPassword as any as User };
    }

    user = await prisma.user.create({
      data: {
        email,
        googleId,
        firstName,
        lastName,
        fullName,
        role,
        avatarUrl,
        status: "ACTIVE",
      },
      include: {
        coach: true,
        student: true,
      },
    });

    const accessToken = signAccessToken({ userId: user.id, type: "access" });

    const { hashedPassword, verificationToken, ...userWithoutPassword } = user;
    return { accessToken, user: userWithoutPassword as any as User };
  }

  async getProfile(userId: string): Promise<{ user: UserProfile }> {
    const user = await this.getUserProfile(userId);
    if (!user) {
      throw new NotFoundException("User profile not found in database");
    }

    const transformedUser = {
      ...user,
      coach: user.coach ? {
        ...user.coach,
        specialties: user.coach.specialties.map((s: any) => s.category.name),
      } : null,
      student: user.student ? {
        ...user.student,
        interestedCategoryIds: user.student.interestedCategories?.map((ic: any) => ic.categoryId) || [],
      } : null,
    };

    return { user: transformedUser };
  }

  async findUserByEmail(email: string): Promise<any> {
    return prisma.user.findUnique({
      where: { email },
      include: {
        coach: true,
        student: true,
      },
    });
  }

  async findUserByGoogleId(googleId: string): Promise<any> {
    return prisma.user.findFirst({
      where: { googleId },
      include: {
        coach: true,
        student: true,
      },
    });
  }

  async getUserProfile(userId: string): Promise<any> {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        coach: {
          include: {
            specialties: {
              include: {
                category: true,
              },
            },
            experiences: {
              orderBy: {
                startDate: 'desc',
              },
            },
          },
        },
        student: {
          include: {
            interestedCategories: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });
  }

  async updateProfile(userId: string, data: Record<string, unknown>): Promise<{ user: Partial<User> }> {
    try {
      const allowedFields = ["firstName", "lastName", "fullName", "avatarUrl", "country", "countryIso"];
      const updateData: Record<string, string> = {} as Record<string, string>;

      if (data.firstName && data.lastName && !data.fullName) {
        data.fullName = `${data.firstName} ${data.lastName}`.trim();
      }

      for (const field of allowedFields) {
        if (data[field] !== undefined) {
          updateData[field] = data[field] as string;
        }
      }

      if (updateData.avatarUrl && updateData.avatarUrl.startsWith("data:")) {
        const uploadResult = await uploadService.uploadAvatar(updateData.avatarUrl, userId);
        updateData.avatarUrl = uploadResult.url;
      }

      if (Object.keys(updateData).length === 0 && !data.interestedCategoryIds) {
        throw new HttpException(
          RESPONSE_CODE.VALIDATION_ERROR,
          "No valid fields provided for update",
          400,
        );
      }

      // Update interested categories if provided (for students)
      if (data.interestedCategoryIds && Array.isArray(data.interestedCategoryIds)) {
        const student = await prisma.student.findUnique({ where: { id: userId } });
        if (student) {
          await prisma.$transaction([
            prisma.interestedCategory.deleteMany({
              where: { studentId: userId },
            }),
            prisma.interestedCategory.createMany({
              data: (data.interestedCategoryIds as string[]).map((categoryId) => ({
                studentId: userId,
                categoryId,
              })),
            }),
          ]);
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          fullName: true,
          email: true,
          avatarUrl: true,
          country: true,
          countryIso: true,
          role: true,
        } as any,
      });

      return { user: updatedUser };
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        RESPONSE_CODE.INTERNAL_SERVER_ERROR,
        "Failed to update profile",
        500,
      );
    }
  }

  async changePassword(userId: string, data: ChangePasswordData): Promise<any> {
    try {
      const { currentPassword, newPassword } = data;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          hashedPassword: true,
        },
      });

      if (!user) {
        throw new NotFoundException("User not found");
      }

      if (!user.hashedPassword) {
        throw new HttpException(
          RESPONSE_CODE.VALIDATION_ERROR,
          "Cannot change password for accounts signed in with Google",
          400,
        );
      }

      // Verify current password
      const isValidPassword = await this.verifyPassword(
        currentPassword,
        user.hashedPassword,
      );

      if (!isValidPassword) {
        throw new UnauthorizedException("Current password is incorrect");
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { hashedPassword },
      });

      return null;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        RESPONSE_CODE.INTERNAL_SERVER_ERROR,
        "Failed to change password",
        500,
      );
    }
  }

  async forgotPassword(email: string): Promise<any> {
    const user = await this.findUserByEmail(email);

    // We don't want to reveal if the email exists for security (standard practice)
    // But we check if the user exists and has a password
    if (user && user.hashedPassword) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpires },
      });

      const baseUrl = env.NEXTAUTH_URL || "http://localhost:3000";
      const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

      await emailService.sendPasswordResetEmail(
        email,
        user.fullName || "Nebula User",
        resetUrl,
      );
    }

    return null;
  }

  async resetPassword(token: string, data: { newPassword: string }): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { resetToken: token },
    });

    if (
      !user ||
      (user.resetTokenExpires && user.resetTokenExpires < new Date())
    ) {
      throw new HttpException(
        RESPONSE_CODE.VALIDATION_ERROR,
        "Invalid or expired reset token",
        400,
      );
    }

    const hashedPassword = await this.hashPassword(data.newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return null;
  }
}

export const authService = new AuthService();
