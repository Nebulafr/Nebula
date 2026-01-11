import { NextRequest } from "next/server";
import { AuthService } from "../services/auth.service";
import {
  googleAuthSchema,
  signinSchema,
  signupSchema,
  changePasswordSchema,
} from "@/lib/validations";
import {
  BadRequestException,
  ValidationException,
  UnauthorizedException,
} from "../utils/http-exception";
import { z } from "zod";

export class AuthController {
  async register(request: NextRequest) {
    let body;
    try {
      body = await request.json();
    } catch (error) {
      throw new BadRequestException("Invalid JSON body");
    }

    let payload;
    try {
      payload = signupSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationException(
          `Validation failed: ${error.errors
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")}`
        );
      }
      throw error;
    }

    return await AuthService.register(payload);
  }

  async signin(request: NextRequest) {
    let body;
    try {
      body = await request.json();
    } catch (error) {
      throw new BadRequestException("Invalid JSON body");
    }

    let payload;
    try {
      payload = signinSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationException(
          `Validation failed: ${error.errors
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")}`
        );
      }
      throw error;
    }

    return await AuthService.signin(payload);
  }

  async googleAuth(request: NextRequest) {
    let body;
    try {
      body = await request.json();
    } catch (error) {
      throw new BadRequestException("Invalid JSON body");
    }

    let payload;
    try {
      payload = googleAuthSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationException(
          `Validation failed: ${error.errors
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")}`
        );
      }
      throw error;
    }

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

    let payload;
    try {
      payload = changePasswordSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationException(
          `Validation failed: ${error.errors
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")}`
        );
      }
      throw error;
    }

    return await AuthService.changePassword(user.id, payload);
  }
}
