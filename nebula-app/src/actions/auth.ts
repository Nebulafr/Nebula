import { auth } from "@/firebase/client";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { apiPost, apiGet } from "@/lib/utils";

export async function signUpWithEmail(data: any) {
  return apiPost("/auth/register", data, {
    requireAuth: false,
    throwOnError: true,
  });
}

export async function signInWithEmail(data: any) {
  return apiPost("/auth/signin", data, {
    requireAuth: false,
    throwOnError: true,
  });
}

export async function signUpWithGoogle(role: string = "student") {
  const provider = new GoogleAuthProvider();
  provider.addScope("email");
  provider.addScope("profile");
  provider.setCustomParameters({ prompt: "select_account" });

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    return apiPost(
      "/auth/google",
      {
        googleId: user.uid,
        email: user.email,
        fullName: user.displayName,
        role,
        avatarUrl: user.photoURL,
      },
      { requireAuth: false, throwOnError: true }
    );
  } catch (error: any) {
    if (error.code === "auth/popup-blocked") {
      // Handle popup blocked case
      throw new Error("Popup blocked. Please allow popups or use redirect.");
    }
    throw error;
  }
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
