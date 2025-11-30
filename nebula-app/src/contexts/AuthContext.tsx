"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { storeAuthData, clearAuthData } from "@/lib/auth-storage";
import {
  signUpWithEmail as apiSignUpWithEmail,
  signInWithEmail as apiSignInWithEmail,
  resetPassword as apiResetPassword,
  SignUpData,
} from "@/actions/auth";
import {
  signInWithGoogle as firebaseSignInWithGoogle,
  SignInData,
} from "@/firebase/auth";
import { UserRole } from "@/generated/prisma";
import { useRouter } from "next/navigation";
import { UserProfile, AuthState, UseUserReturn } from "@/hooks/use-user";
import { getUserProfile } from "@/actions/user";

export interface AuthContextValue extends UseUserReturn {
  signUp: (data: SignUpData) => Promise<{ accessToken: string; user: any }>;
  signIn: (data: SignInData) => Promise<{ accessToken: string; user: any }>;
  signInWithGoogle: (
    role?: UserRole
  ) => Promise<{ accessToken: string; user: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authState, setAuthState] = useState<AuthState>("LOADING");
  const router = useRouter();

  const updateUserState = useCallback((userData: UserProfile | null) => {
    console.log({ userData });

    if (!userData) {
      setProfile(null);
      setAuthState("UNAUTHENTICATED");
      return;
    }

    setProfile(userData);
    const hasProfile =
      userData.role === "ADMIN" || userData.coach || userData.student;
    setAuthState(
      hasProfile ? "AUTHENTICATED_WITH_PROFILE" : "AUTHENTICATED_NO_PROFILE"
    );
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await getUserProfile();
      const userData = response.data?.user!;
      updateUserState(userData);
    } catch (error) {
      console.error("Error refreshing user profile:", error);
      updateUserState(null);
    }
  }, [updateUserState]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const handleAuthAction = async <T extends { accessToken: string; user: any }>(
    action: () => Promise<T>
  ): Promise<T> => {
    try {
      const result = await action();
      storeAuthData(result);
      updateUserState(result.user);
      return result;
    } catch (err) {
      const error = err as Error;
      clearAuthData();
      updateUserState(null);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Make API call to logout endpoint for server-side cleanup
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.warn("API logout failed, continuing with local cleanup:", error);
    } finally {
      // Always clear local auth data and redirect
      clearAuthData();
      updateUserState(null);
      router.push("/login");
    }
  };

  const authActions = {
    signUp: (data: SignUpData) =>
      handleAuthAction(() => apiSignUpWithEmail(data)),
    signIn: (data: SignInData) =>
      handleAuthAction(() => apiSignInWithEmail(data)),
    signInWithGoogle: (role?: UserRole) =>
      handleAuthAction(() => firebaseSignInWithGoogle(role)),
    resetPassword: (email: string) => apiResetPassword(email),
    signOut,
  };

  const isAuthenticated =
    authState === "AUTHENTICATED_WITH_PROFILE" ||
    authState === "AUTHENTICATED_NO_PROFILE";

  const value: AuthContextValue = {
    profile,
    coachProfile: profile?.coach || null,
    studentProfile: profile?.student || null,
    loading: authState === "LOADING",
    authState,
    isAuthenticated,
    isCoach: profile?.role === "COACH",
    isStudent: profile?.role === "STUDENT",
    isAdmin: profile?.role === "ADMIN",
    refreshUser,
    ...authActions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
