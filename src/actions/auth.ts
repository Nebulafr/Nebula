import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/firebase/client";
import { UserRole } from "../generated/prisma";
import { SignInData } from "@/firebase/auth";
import { toast } from "react-toastify";

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}

export async function signUpWithEmail(
  data: SignUpData
): Promise<{ accessToken: string; user: any }> {
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to create account");
    }

    return result.data;
  } catch (error: any) {
    throw new Error(error.message || "Failed to create account");
  }
}

export async function signInWithEmail(
  data: SignInData
): Promise<{ accessToken: string; user: any }> {
  try {
    const response = await fetch("/api/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to sign in");
    }

    toast.success("Signed in successfully!");
    return result.data;
  } catch (error: any) {
    toast.error(error.message);
    throw new Error(error.code);
  }
}

export async function signUpWithGoogle(
  role: UserRole = UserRole.STUDENT
): Promise<{ accessToken: string; user: any }> {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");
    provider.setCustomParameters({
      prompt: "select_account",
    });

    if (typeof window !== "undefined") {
      sessionStorage.setItem("pendingGoogleSignUpRole", role);
    }

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    if (typeof window !== "undefined") {
      sessionStorage.removeItem("pendingGoogleSignUpRole");
    }

    const registerResponse = await fetch("/api/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        googleId: user.uid,
        email: user.email as string,
        fullName: user.displayName as string,
        role: role,
        avatarUrl: user.photoURL || undefined,
      }),
    });

    const registerResult = await registerResponse.json();

    if (!registerResult.success) {
      throw new Error(registerResult.message || "Failed to create account");
    }

    return registerResult.data;
  } catch (error: any) {
    if (error.code === "auth/popup-blocked") {
      const provider = new GoogleAuthProvider();
      provider.addScope("email");
      provider.addScope("profile");
      provider.setCustomParameters({
        prompt: "select_account",
      });
      await signInWithRedirect(auth, provider);
      throw new Error("Redirecting to Google sign-up...");
    }
    throw new Error(error.message || "Failed to create account");
  }
}

export async function handleGoogleRedirectResult(): Promise<{
  accessToken: string;
  user: any;
} | null> {
  try {
    const result = await getRedirectResult(auth);
    if (!result || !result.user) {
      return null;
    }

    const user = result.user;
    const role =
      ((typeof window !== "undefined"
        ? sessionStorage.getItem("pendingGoogleSignUpRole")
        : null) as UserRole) || UserRole.STUDENT;

    if (typeof window !== "undefined") {
      sessionStorage.removeItem("pendingGoogleSignUpRole");
    }

    const registerResponse = await fetch("/api/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        googleId: user.uid,
        email: user.email as string,
        fullName: user.displayName as string,
        role: role,
        avatarUrl: user.photoURL || undefined,
      }),
    });

    const registerResult = await registerResponse.json();

    if (!registerResult.success) {
      throw new Error(registerResult.message || "Failed to create account");
    }

    return registerResult.data;
  } catch (error: any) {
    throw new Error(error.message || "Failed to handle redirect result");
  }
}

export async function resetPassword(email: string): Promise<void> {
  try {
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to send reset email");
    }

    toast.success("Password reset email sent!");
  } catch (error: any) {
    toast.error(error.message);
    throw new Error(error.message || "Failed to send reset email");
  }
}
