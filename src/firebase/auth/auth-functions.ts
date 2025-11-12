"use client";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  type User,
} from "firebase/auth";
import { auth, db } from "../config";
import { createUserDocument } from "./create-user";
import { getUserByEmailAndRole } from "@/services/user-service";
import type { User as UserModel } from "@/models";

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  role: "student" | "coach";
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

// Helper function to handle Firebase auth errors
function handleAuthError(error: any): never {
  if (process.env.NODE_ENV === "development") {
    console.error("Auth error:", error);
  }

  switch (error.code) {
    case "auth/email-already-in-use":
      throw new AuthError(
        error.code,
        "An account with this email already exists."
      );
    case "auth/weak-password":
      throw new AuthError(
        error.code,
        "Password should be at least 6 characters."
      );
    case "auth/invalid-email":
      throw new AuthError(error.code, "Invalid email address.");
    case "auth/user-not-found":
      throw new AuthError(error.code, "No account found with this email.");
    case "auth/wrong-password":
      throw new AuthError(error.code, "Incorrect password.");
    case "auth/invalid-credential":
      throw new AuthError(error.code, "Invalid email or password.");
    case "auth/too-many-requests":
      throw new AuthError(
        error.code,
        "Too many failed attempts. Please try again later."
      );
    case "auth/user-disabled":
      throw new AuthError(error.code, "This account has been disabled.");
    case "auth/operation-not-allowed":
      throw new AuthError(error.code, "This sign-in method is not enabled.");
    case "auth/requires-recent-login":
      throw new AuthError(
        error.code,
        "Please log in again to perform this action."
      );
    case "auth/popup-blocked":
      throw new AuthError(
        error.code,
        "Popup was blocked by your browser. Please allow popups for this site or try again."
      );
    case "auth/popup-closed-by-user":
      throw new AuthError(error.code, "Sign-in was cancelled.");
    case "auth/cancelled-popup-request":
      throw new AuthError(error.code, "Sign-in was cancelled.");
    case "auth/redirect-initiated":
      throw new AuthError(error.code, "Redirecting to sign-in page...");
    default:
      throw new AuthError(
        error.code || "unknown",
        error.message || "An unexpected error occurred."
      );
  }
}

// Sign up with email and password
export async function signUpWithEmail(data: SignUpData): Promise<User> {
  try {
    // Check if user already exists with this email and role
    const existingUser = await getUserByEmailAndRole(data.email, data.role);
    if (existingUser) {
      throw new AuthError(
        "auth/email-already-in-use",
        `A ${data.role} account with this email already exists.`
      );
    }

    const { user } = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    // Update user profile
    await updateProfile(user, {
      displayName: data.fullName,
    });

    // Create user document in Firestore
    await createUserDocument(user, data.role, data.fullName);

    return user;
  } catch (error: any) {
    handleAuthError(error);
  }
}

// Sign in with email and password
export async function signInWithEmail(data: SignInData): Promise<User> {
  try {
    const { user } = await signInWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    return user;
  } catch (error: any) {
    handleAuthError(error);
  }
}

// Sign in with Google (with popup fallback to redirect)
export async function signInWithGoogle(
  role: "student" | "coach" = "student"
): Promise<User> {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");

    // Store role for redirect fallback
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pendingGoogleSignInRole", role);
    }

    try {
      // Try popup first
      const { user } = await signInWithPopup(auth, provider);

      // Clear stored role since popup succeeded
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("pendingGoogleSignInRole");
      }

      // Create user document if this is a new user
      await createUserDocument(user, role, user.displayName);

      return user;
    } catch (popupError: any) {
      // If popup is blocked, fallback to redirect
      if (popupError.code === "auth/popup-blocked") {
        console.log("Popup blocked, falling back to redirect");
        await signInWithRedirect(auth, provider);
        // signInWithRedirect doesn't return a user, it redirects the page
        throw new AuthError(
          "auth/redirect-initiated",
          "Redirecting to Google sign-in..."
        );
      }

      // Clear stored role on other errors
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
      throw error; // Don't modify this one
    }
    handleAuthError(error);
  }
}

// Handle redirect result (call this on app initialization)
export async function handleGoogleRedirectResult(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      const user = result.user;

      // Get the stored role or default to student
      const role =
        ((typeof window !== "undefined"
          ? sessionStorage.getItem("pendingGoogleSignInRole")
          : null) as "student" | "coach") || "student";

      // Clear stored role
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("pendingGoogleSignInRole");
      }

      // Create user document if this is a new user
      await createUserDocument(user, role, user.displayName);

      return user;
    }
    return null;
  } catch (error: any) {
    console.error("Error handling Google redirect result:", error);
    handleAuthError(error);
  }
}

// Sign out
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    handleAuthError(error);
  }
}

// Reset password
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    handleAuthError(error);
  }
}

// Update user password (requires recent authentication)
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

    // Re-authenticate user
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, newPassword);
  } catch (error: any) {
    handleAuthError(error);
  }
}

// Update user profile
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
    handleAuthError(error);
  }
}

// Get current user
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!auth.currentUser;
}

// Wait for auth state to be determined
export function waitForAuthState(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
}
