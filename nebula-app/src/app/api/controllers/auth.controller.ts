import { NextRequest } from "next/server";
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

export class AuthController {
  async register(request: NextRequest) {
    let body;
    try {
      body = await request.json();
    } catch {
      throw new BadRequestException("Invalid JSON body");
    }

    const payload = signupSchema.parse(body);

    return await authService.register(payload);
  }

  async signin(request: NextRequest) {
    let body;
    try {
      body = await request.json();
    } catch {
      throw new BadRequestException("Invalid JSON body");
    }

    const payload = signinSchema.parse(body);

    return await authService.signin(payload);
  }

  async googleAuth(request: NextRequest) {
    let body;
    try {
      body = await request.json();
    } catch {
      throw new BadRequestException("Invalid JSON body");
    }

    const payload = googleAuthSchema.parse(body);

    return await authService.googleAuth(payload);
  }

  async getProfile(request: NextRequest) {
    const user = (request as unknown as AuthenticatedRequest).user;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    return await authService.getProfile(user.id);
  }

  async updateProfile(request: NextRequest) {
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

    return await authService.updateProfile(user.id, body);
  }

  async changePassword(request: NextRequest) {
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

    return await authService.changePassword(user.id, payload);
  }

  async verifyEmail(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      throw new BadRequestException("Verification token is required");
    }

    return await authService.verifyEmail(token);
  }

  async forgotPassword(request: NextRequest) {
    let body;
    try {
      body = await request.json();
    } catch {
      throw new BadRequestException("Invalid JSON body");
    }

    const payload = forgotPasswordSchema.parse(body);

    return await authService.forgotPassword(payload.email);
  }

  async resetPassword(request: NextRequest) {
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

    return await authService.resetPassword(token, payload);
  }
}

export const authController = new AuthController();
