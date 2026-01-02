import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  type RegisterData,
  type SigninData,
  type GoogleAuthData,
} from "@/lib/validations";
import HttpException, {
  UnauthorizedException,
  NotFoundException,
} from "../utils/http-exception";
import { RESPONSE_CODE } from "@/types";
import { sendSuccess } from "../utils/send-response";

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
    hashedPassword: string
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
        400
      );
    }

    const hashedPassword = await this.hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        fullName,
        role,
        status: "ACTIVE",
      },
    });

    const accessToken = this.generateAccessToken(user.id);
    return sendSuccess(
      { accessToken, user },
      "Account created successfully",
      201
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
      user.hashedPassword
    );
    if (!isValidPassword) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const accessToken = this.generateAccessToken(user.id);
    return sendSuccess({ accessToken, user }, "Signed in successfully");
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
        "Account linked and signed in successfully"
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
      201
    );
  }

  static async getProfile(userId: string) {
    const user = await this.getUserProfile(userId);
    console.log({ user });
    if (!user) {
      throw new NotFoundException("User profile not found in database");
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
        coach: true,
        student: true,
      },
    });
  }

  static async updateProfile(userId: string, data: any) {
    try {
      // Only allow updating specific fields for security
      const allowedFields = ['fullName', 'avatarUrl'];
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
          400
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
        }
      });

      return sendSuccess({ user: updatedUser }, "Profile updated successfully");
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        RESPONSE_CODE.INTERNAL_SERVER_ERROR,
        "Failed to update profile",
        500
      );
    }
  }
}
