import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  type User,
} from "firebase/auth";
import { auth, db } from "./config";
import { createUserDocument } from "./firestore/user";
import { toast } from "react-toastify";

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

export async function signUpWithEmail(data: SignUpData): Promise<User> {
  try {
    const { user } = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );
    await updateProfile(user, {
      displayName: data.fullName,
    });
    await createUserDocument(user, data.role, data.fullName);
    toast.success("Account created successfully!");
    return user;
  } catch (error: any) {
    // Handle signup-specific errors with toastify
    let message: string;

    switch (error.code) {
      case "auth/email-already-in-use":
        message = "An account with this email already exists.";
        break;
      case "auth/weak-password":
        message = "Password should be at least 6 characters.";
        break;
      case "auth/invalid-email":
        message = "Invalid email address.";
        break;
      default:
        message = "Failed to create account. Please try again.";
    }

    toast.error(message);
    throw new AuthError(error.code || "unknown", message);
  }
}

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

export async function signInWithGoogle(
  role: "student" | "coach" = "student"
): Promise<User> {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");

    if (typeof window !== "undefined") {
      sessionStorage.setItem("pendingGoogleSignInRole", role);
    }

    try {
      const { user } = await signInWithPopup(auth, provider);

      if (typeof window !== "undefined") {
        sessionStorage.removeItem("pendingGoogleSignInRole");
      }

      await createUserDocument(user, role, user.displayName);

      return user;
    } catch (popupError: any) {
      if (popupError.code === "auth/popup-blocked") {
        console.log("Popup blocked, falling back to redirect");
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
    handleAuthError(error);
  }
}

export async function handleGoogleRedirectResult(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      const user = result.user;

      const role =
        ((typeof window !== "undefined"
          ? sessionStorage.getItem("pendingGoogleSignInRole")
          : null) as "student" | "coach") || "student";

      if (typeof window !== "undefined") {
        sessionStorage.removeItem("pendingGoogleSignInRole");
      }

      await createUserDocument(user, role, user.displayName);

      return user;
    }
    return null;
  } catch (error: any) {
    console.error("Error handling Google redirect result:", error);
    handleAuthError(error);
  }
}

export async function signOut(): Promise<void> {
  try {
    await auth.signOut();
  } catch (error: any) {
    handleAuthError(error);
  }
}

export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    handleAuthError(error);
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
    handleAuthError(error);
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
    handleAuthError(error);
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
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
}
