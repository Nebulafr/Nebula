import { NextRequest } from "next/server";
import { AuthService } from "../services/auth.service";
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
    } catch (error) {
      throw new BadRequestException("Invalid JSON body");
    }

    const payload = signupSchema.parse(body);

    return await AuthService.register(payload);
  }

  async signin(request: NextRequest) {
    let body;
    try {
      body = await request.json();
    } catch (error) {
      throw new BadRequestException("Invalid JSON body");
    }

    const payload = signinSchema.parse(body);

    return await AuthService.signin(payload);
  }

  async googleAuth(request: NextRequest) {
    let body;
    try {
      body = await request.json();
    } catch (error) {
      throw new BadRequestException("Invalid JSON body");
    }

    const payload = googleAuthSchema.parse(body);

    return await AuthService.googleAuth(payload);
  }

  async getProfile(request: NextRequest) {
    const user = (request as any).user;
    
    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    return await AuthService.getProfile(user.id);
  }

  async updateProfile(request: NextRequest) {
    const user = (request as any).user;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      throw new BadRequestException("Invalid JSON body");
    }

    return await AuthService.updateProfile(user.id, body);
  }

  async changePassword(request: NextRequest) {
    const user = (request as any).user;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      throw new BadRequestException("Invalid JSON body");
    }

    const payload = changePasswordSchema.parse(body);

    return await AuthService.changePassword(user.id, payload);
  }

  async verifyEmail(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      throw new BadRequestException("Verification token is required");
    }

    return await AuthService.verifyEmail(token);
  }

  async forgotPassword(request: NextRequest) {
    let body;
    try {
      body = await request.json();
    } catch (error) {
      throw new BadRequestException("Invalid JSON body");
    }

    const payload = forgotPasswordSchema.parse(body);

    return await AuthService.forgotPassword(payload.email);
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
    } catch (error) {
      throw new BadRequestException("Invalid JSON body");
    }

    const payload = resetPasswordSchema.parse(body);

    return await AuthService.resetPassword(token, payload);
  }
}
