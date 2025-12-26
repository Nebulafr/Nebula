import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "./client";
import { toast } from "react-toastify";
import { UserRole } from "@/generated/prisma";
import { makeRequest } from "@/lib/utils";

export async function signInWithGoogle(role: UserRole = UserRole.STUDENT) {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");
    provider.setCustomParameters({
      prompt: "select_account",
    });

    if (typeof window !== "undefined") {
      sessionStorage.setItem("pendingGoogleSignInRole", role);
    }

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (typeof window !== "undefined") {
        sessionStorage.removeItem("pendingGoogleSignInRole");
      }

      const payload = {
        googleId: user.uid,
        email: user.email as string,
        fullName: user.displayName as string,
        role: role,
        avatarUrl: user.photoURL || undefined,
      };

      const response = await makeRequest("/auth/google", "POST", {
        body: payload,
        requireAuth: false,
      });

      console.log("Firebase auth response:", { response });

      if (!response.success) {
        throw new Error(response.message || "Authentication failed");
      }

      toast.success(response.message || "Authentication successful!");
      return response;
    } catch (popupError: any) {
      if (
        popupError.code === "auth/popup-blocked" ||
        popupError.code === "auth/popup-closed-by-user" ||
        popupError.message?.includes("Cross-Origin-Opener-Policy") ||
        popupError.message?.includes("popup")
      ) {
        await signInWithRedirect(auth, provider);
        throw new Error("Redirecting to Google sign-in...");
      }

      if (typeof window !== "undefined") {
        sessionStorage.removeItem("pendingGoogleSignInRole");
      }

      throw popupError;
    }
  } catch (error: any) {
    if (
      error.code === "auth/popup-closed-by-user" ||
      error.code === "auth/cancelled-popup-request"
    ) {
      throw new Error("Sign-in was cancelled.");
    }
    if (error.code === "auth/redirect-initiated") {
      throw error;
    }
    if (error instanceof Error) {
      toast.error(error.message);
      throw error;
    }
    toast.error("An unexpected error occurred");
    throw new Error("An unexpected error occurred");
  }
}

export async function handleGoogleRedirectResult(): Promise<{
  accessToken: string;
  user: any;
} | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      const user = result.user;

      const role =
        ((typeof window !== "undefined"
          ? sessionStorage.getItem("pendingGoogleSignInRole")
          : null) as UserRole) || UserRole.STUDENT;

      if (typeof window !== "undefined") {
        sessionStorage.removeItem("pendingGoogleSignInRole");
      }
      const payload = {
        googleId: user.uid,
        email: user.email as string,
        fullName: user.displayName as string,
        role: role,
        avatarUrl: user.photoURL || undefined,
      };

      const response = await makeRequest("/auth/google", "POST", {
        body: payload,
        requireAuth: false,
      });

      if (!response.success) {
        throw new Error(response.message || "Authentication failed");
      }

      return response;
    }
    return null;
  } catch (error: any) {
    console.error("Error handling Google redirect result:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to handle redirect result");
  }
}
