import { NextRequest, NextResponse } from "next/server";
import { type AuthenticatedRequest } from "@/types";
import { authService } from "../services/auth.service";
import {
  googleAuthSchema,
  signinSchema,
  signupSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations";
import {
  BadRequestException,
  UnauthorizedException,
} from "../utils/http-exception";
import { sendSuccess } from "../utils/send-response";

export class AuthController {
  async register(request: NextRequest): Promise<NextResponse> {
    let body;
    try {
      body = await request.json();
    } catch {
      throw new BadRequestException("Invalid JSON body");
    }

    const payload = signupSchema.parse(body);

    const result = await authService.register(payload);
    return sendSuccess(result, "Account created. Please check your email to verify your account.", 201);
  }

  async signin(request: NextRequest): Promise<NextResponse> {
    let body;
    try {
      body = await request.json();
    } catch {
      throw new BadRequestException("Invalid JSON body");
    }

    const payload = signinSchema.parse(body);

    const result = await authService.signin(payload);
    return sendSuccess(result, "Signed in successfully");
  }

  async googleAuth(request: NextRequest): Promise<NextResponse> {
    let body;
    try {
      body = await request.json();
    } catch {
      throw new BadRequestException("Invalid JSON body");
    }

    const payload = googleAuthSchema.parse(body);

    const result = await authService.googleAuth(payload);
    const message = (result as any).isNewUser ? "Account created successfully" : "Signed in successfully";
    return sendSuccess(result, message);
  }

  async getProfile(request: NextRequest): Promise<NextResponse> {
    const user = (request as unknown as AuthenticatedRequest).user;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    const result = await authService.getProfile(user.id);
    return sendSuccess(result, "Profile fetched successfully");
  }

  async updateProfile(request: NextRequest): Promise<NextResponse> {
    const user = (request as unknown as AuthenticatedRequest).user;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    let body;
    try {
      body = await request.json();
    } catch {
      throw new BadRequestException("Invalid JSON body");
    }

    const result = await authService.updateProfile(user.id, body);
    return sendSuccess(result, "Profile updated successfully");
  }

  async changePassword(request: NextRequest): Promise<NextResponse> {
    const user = (request as unknown as AuthenticatedRequest).user;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    let body;
    try {
      body = await request.json();
    } catch {
      throw new BadRequestException("Invalid JSON body");
    }

    const payload = changePasswordSchema.parse(body);

    const result = await authService.changePassword(user.id, payload);
    return sendSuccess(result, "Password changed successfully");
  }

  async verifyEmail(request: NextRequest): Promise<NextResponse> {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      throw new BadRequestException("Verification token is required");
    }

    const result = await authService.verifyEmail(token);
    return sendSuccess(result, "Email verified successfully. You can now sign in.");
  }

  async forgotPassword(request: NextRequest): Promise<NextResponse> {
    let body;
    try {
      body = await request.json();
    } catch {
      throw new BadRequestException("Invalid JSON body");
    }

    const payload = forgotPasswordSchema.parse(body);

    const result = await authService.forgotPassword(payload.email);
    return sendSuccess(result, "If an account exists with that email, we've sent instructions to reset your password.");
  }

  async resetPassword(request: NextRequest): Promise<NextResponse> {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      throw new BadRequestException("Reset token is required");
    }

    let body;
    try {
      body = await request.json();
    } catch {
      throw new BadRequestException("Invalid JSON body");
    }

    const payload = resetPasswordSchema.parse(body);

    const result = await authService.resetPassword(token, payload);
    return sendSuccess(result, "Password successfully reset. You can now sign in with your new password.");
  }
}

export const authController = new AuthController();
