import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  type RegisterData,
  type SigninData,
  type GoogleAuthData,
} from "../utils/schemas";
import HttpException, {
  UnauthorizedException,
  NotFoundException,
} from "../utils/http-exception";
import { RESPONSE_CODE } from "@/types";
import sendResponse from "../utils/send-response";

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
    return sendResponse.success(
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
    return sendResponse.success(
      { accessToken, user },
      "Signed in successfully"
    );
  }

  static async googleAuth(data: GoogleAuthData) {
    const { googleId, email, fullName, role, avatarUrl } = data;

    // Check if user exists with this Google ID
    let user = await this.findUserByGoogleId(googleId);

    if (user) {
      // User exists, sign them in
      const accessToken = this.generateAccessToken(user.id);
      return sendResponse.success(
        { accessToken, user },
        "Signed in successfully"
      );
    }

    // Check if user exists with this email but no Google ID
    user = await this.findUserByEmail(email);
    if (user) {
      // Link Google ID to existing account
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId, avatarUrl },
        include: {
          coach: true,
          student: true,
        },
      });

      const accessToken = this.generateAccessToken(user.id);
      return sendResponse.success(
        { accessToken, user },
        "Account linked and signed in successfully"
      );
    }

    // Create new user
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
    return sendResponse.success(
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

    return sendResponse.success({ user }, "Profile fetched successfully");
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
}
