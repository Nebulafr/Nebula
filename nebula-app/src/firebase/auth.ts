import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth } from "./client";
import { toast } from "react-toastify";
import { UserRole } from "@/generated/prisma";

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}

export interface SignInData {
  email: string;
  password: string;
}

export class AuthError extends Error {
  constructor(
    public code: string,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = "AuthError";
  }
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
      throw new AuthError(
        "signup-failed",
        result.message || "Failed to create account"
      );
    }

    toast.success("Account created successfully!");
    return result.data;
  } catch (error: any) {
    let message: string;
    if (error instanceof AuthError) {
      message = error.message;
    } else {
      message = "Failed to create account. Please try again.";
    }

    toast.error(message);
    throw new AuthError(error.code || "unknown", message);
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
      throw new AuthError(
        "signin-failed",
        result.message || "Failed to sign in"
      );
    }

    toast.success("Signed in successfully!");
    return result.data;
  } catch (error: any) {
    let message: string;
    if (error instanceof AuthError) {
      message = error.message;
    } else {
      message = "Failed to sign in. Please try again.";
    }

    toast.error(message);
    throw new AuthError(error.code || "unknown", message);
  }
}

export async function signInWithGoogle(
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
      sessionStorage.setItem("pendingGoogleSignInRole", role);
    }

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (typeof window !== "undefined") {
        sessionStorage.removeItem("pendingGoogleSignInRole");
      }

      // Use unified Google auth endpoint
      const response = await fetch("/api/auth/google", {
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

      const authResult = await response.json();

      if (!authResult.success) {
        throw new AuthError(
          "auth-failed",
          authResult.message || "Authentication failed"
        );
      }

      toast.success(authResult.message || "Authentication successful!");
      return authResult.data;
    } catch (popupError: any) {
      if (
        popupError.code === "auth/popup-blocked" ||
        popupError.code === "auth/popup-closed-by-user" ||
        popupError.message?.includes("Cross-Origin-Opener-Policy") ||
        popupError.message?.includes("popup")
      ) {
        await signInWithRedirect(auth, provider);
        throw new AuthError(
          "auth/redirect-initiated",
          "Redirecting to Google sign-in..."
        );
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
      throw new AuthError(error.code, "Sign-in was cancelled.");
    }
    if (error.code === "auth/redirect-initiated") {
      throw error;
    }
    if (error instanceof AuthError) {
      toast.error(error.message);
      throw error;
    }
    toast.error("An unexpected error occurred");
    throw new AuthError("unknown", "An unexpected error occurred");
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

      // Use unified Google auth endpoint
      const response = await fetch("/api/auth/google", {
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

      const authResult = await response.json();

      if (!authResult.success) {
        throw new AuthError(
          "auth-failed",
          authResult.message || "Failed to authenticate with Google"
        );
      }

      return authResult.data;
    }
    return null;
  } catch (error: any) {
    console.error("Error handling Google redirect result:", error);
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError("unknown", "Failed to handle redirect result");
  }
}

export async function signOut(): Promise<void> {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("pendingGoogleSignInRole");
    }

    await auth.signOut();
  } catch (error: any) {
    if (error instanceof AuthError) {
      throw error;
    }
    toast.error("An unexpected error occurred");
    throw new AuthError(
      "unknown",
      error.message || "An unexpected error occurred"
    );
  }
}

export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    if (error instanceof AuthError) {
      throw error;
    }
    toast.error("An unexpected error occurred");
    throw new AuthError(
      "unknown",
      error.message || "An unexpected error occurred"
    );
  }
}

export async function updateUserPassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new AuthError(
        "auth/user-not-found",
        "No user is currently signed in."
      );
    }

    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    await reauthenticateWithCredential(user, credential);

    await updatePassword(user, newPassword);
  } catch (error: any) {
    if (error instanceof AuthError) {
      throw error;
    }
    toast.error("An unexpected error occurred");
    throw new AuthError(
      "unknown",
      error.message || "An unexpected error occurred"
    );
  }
}

export async function updateUserProfile(data: {
  displayName?: string;
  photoURL?: string;
}): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new AuthError(
        "auth/user-not-found",
        "No user is currently signed in."
      );
    }

    await updateProfile(user, data);
  } catch (error: any) {
    if (error instanceof AuthError) {
      throw error;
    }
    toast.error("An unexpected error occurred");
    throw new AuthError(
      "unknown",
      error.message || "An unexpected error occurred"
    );
  }
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

export function isAuthenticated(): boolean {
  return !!auth.currentUser;
}

export function waitForAuthState(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}
