import { NextRequest } from "next/server";
import { AuthService } from "../services/auth.service";
import {
  registerSchema,
  signinSchema,
  googleAuthSchema,
} from "../utils/schemas";

export class AuthController {
  async register(request: NextRequest) {
    const body = await request.json();
    const payload = registerSchema.parse(body);
    return await AuthService.register(payload);
  }

  async signin(request: NextRequest) {
    const body = await request.json();
    const payload = signinSchema.parse(body);
    return await AuthService.signin(payload);
  }

  async googleAuth(request: NextRequest) {
    const body = await request.json();
    const payload = googleAuthSchema.parse(body);
    return await AuthService.googleAuth(payload);
  }

  async getProfile(request: NextRequest) {
    const user = (request as any).user;
    return await AuthService.getProfile(user.id);
  }
}
