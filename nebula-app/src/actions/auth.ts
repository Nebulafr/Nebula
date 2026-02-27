import { auth } from "@/firebase/client";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { apiPost, apiGet } from "@/lib/utils";
import { AuthResponse } from "@/types";

export async function signUpWithEmail(data: any): Promise<AuthResponse> {
  const response = await apiPost<AuthResponse>("/auth/register", data, {
    requireAuth: false,
    throwOnError: true,
  });
  return response.data!;
}

export async function signInWithEmail(data: any): Promise<AuthResponse> {
  const response = await apiPost<AuthResponse>("/auth/signin", data, {
    requireAuth: false,
    throwOnError: true,
  });
  return response.data!;
}


export async function requestPasswordReset(email: string) {
  return apiPost("/auth/forgot-password", { email }, {
    requireAuth: false,
    throwOnError: true,
  });
}


export async function completePasswordReset(token: string, data: any) {
  return apiPost(`/auth/reset-password?token=${token}`, data, {
    requireAuth: false,
    throwOnError: true,
  });
}

export async function verifyEmail(token: string) {
  return apiGet(`/auth/verify-email?token=${token}`, {
    requireAuth: false,
    throwOnError: true,
  });
}
