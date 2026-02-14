import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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
import { RESPONSE_CODE } from "@/types";
import { sendSuccess } from "../utils/send-response";
import { EmailService } from "./email.service";
import crypto from "crypto";

export class AuthService {
  static generateAccessToken(userId: string): string {
    const secret = process.env.ACCESS_TOKEN_SECRET || "ACCESS_TOKEN_SECRET";
    return jwt.sign({ userId, type: "access" }, secret, { expiresIn: "7d" });
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static async register(data: RegisterData) {
    const { email, password, fullName, role } = data;

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
        fullName,
        role,
        status: "PENDING",
        verificationToken,
        verificationTokenExpires,
      },
    });

    // Send verification email
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

    await EmailService.sendVerificationEmail(
      email,
      fullName || "Nebula User",
      verificationUrl,
    );

    return sendSuccess(
      { user },
      "Account created. Please check your email to verify your account.",
      201,
    );
  }

  static async signin(data: SigninData) {
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

    const accessToken = this.generateAccessToken(user.id);
    return sendSuccess({ accessToken, user }, "Signed in successfully");
  }

  static async verifyEmail(token: string) {
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

    return sendSuccess(
      { user: updatedUser },
      "Email verified successfully. You can now sign in.",
    );
  }

  static async googleAuth(data: GoogleAuthData) {
    const { googleId, email, fullName, role, avatarUrl } = data;

    let user = await this.findUserByGoogleId(googleId);

    if (user) {
      const accessToken = this.generateAccessToken(user.id);
      return sendSuccess({ accessToken, user }, "Signed in successfully");
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

      const accessToken = this.generateAccessToken(user.id);
      return sendSuccess(
        { accessToken, user },
        "Account linked and signed in successfully",
      );
    }

    user = await prisma.user.create({
      data: {
        email,
        googleId,
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

    const accessToken = this.generateAccessToken(user.id);
    return sendSuccess(
      { accessToken, user },
      "Account created successfully",
      201,
    );
  }

  static async getProfile(userId: string) {
    const user = await this.getUserProfile(userId);
    console.log({ user });
    if (!user) {
      throw new NotFoundException("User profile not found in database");
    }

    // Transform specialties to string array if coach exists
    if (user.coach && (user.coach as any).specialties) {
      (user.coach as any).specialties = (user.coach as any).specialties.map(
        (s: any) => s.category.name
      );
    }

    return sendSuccess({ user }, "Profile fetched successfully");
  }

  static async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        coach: true,
        student: true,
      },
    });
  }

  static async findUserByGoogleId(googleId: string) {
    return prisma.user.findFirst({
      where: { googleId },
      include: {
        coach: true,
        student: true,
      },
    });
  }

  static async getUserProfile(userId: string) {
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
          },
        },
        student: true,
      },
    });
  }

  static async updateProfile(userId: string, data: any) {
    try {
      // Only allow updating specific fields for security
      const allowedFields = ["fullName", "avatarUrl"];
      const updateData: any = {};

      for (const field of allowedFields) {
        if (data[field] !== undefined) {
          updateData[field] = data[field];
        }
      }

      if (Object.keys(updateData).length === 0) {
        throw new HttpException(
          RESPONSE_CODE.VALIDATION_ERROR,
          "No valid fields provided for update",
          400,
        );
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          fullName: true,
          email: true,
          avatarUrl: true,
          role: true,
        },
      });

      return sendSuccess({ user: updatedUser }, "Profile updated successfully");
    } catch (error: any) {
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

  static async changePassword(userId: string, data: ChangePasswordData) {
    try {
      const { currentPassword, newPassword } = data;

      // Get user with password
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

      return sendSuccess(null, "Password changed successfully");
    } catch (error: any) {
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

  static async forgotPassword(email: string) {
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

      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

      await EmailService.sendPasswordResetEmail(
        email,
        user.fullName || "Nebula User",
        resetUrl,
      );
    }

    return sendSuccess(
      null,
      "If an account exists with that email, we've sent instructions to reset your password.",
    );
  }

  static async resetPassword(token: string, data: any) {
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

    return sendSuccess(
      null,
      "Password successfully reset. You can now sign in with your new password.",
    );
  }
}
