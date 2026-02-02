"use client";
import { createContext, useEffect, useState, useCallback } from "react";
import { storeAuthData, clearAuthData } from "@/lib/auth-storage";
import { makeRequest } from "@/lib/utils";
import { UserRole } from "@/generated/prisma";
import { UserProfile, AuthState } from "@/hooks/use-user";
import { SignupData, SigninData } from "@/lib/validations";
import { getUserProfile } from "@/actions/user";
import {
  signUpWithEmail,
  signInWithEmail,
  requestPasswordReset,
  completePasswordReset,
} from "@/actions/auth";
import { signInWithGoogle } from "@/firebase/auth";
import { ApiResponse } from "@/types";
import { useRouter } from "next/navigation";

interface AuthResponse {
  accessToken: string;
  user: any;
}

export interface AuthContextValue {
  profile: UserProfile | null;
  loading: boolean;
  authState: AuthState;
  isAuthenticated: boolean;
  isCoach: boolean;
  isStudent: boolean;
  isAdmin: boolean;
  refreshUser: () => Promise<void>;
  signUp: (data: SignupData) => Promise<ApiResponse<AuthResponse>>;
  signIn: (data: SigninData) => Promise<ApiResponse<AuthResponse>>;
  signInWithGoogle: (role?: UserRole) => Promise<ApiResponse<AuthResponse>>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<ApiResponse<any>>;
  completePasswordReset: (token: string, data: any) => Promise<ApiResponse<any>>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authState, setAuthState] = useState<AuthState>("LOADING");
  const router = useRouter();

  const updateUserState = useCallback((userData: UserProfile | null) => {
    setProfile(userData);

    if (!userData) {
      setAuthState("UNAUTHENTICATED");
      router.push("/login");
      return;
    }

    const hasProfile =
      userData.role === "ADMIN" || userData.coach || userData.student;
    setAuthState(
      hasProfile ? "AUTHENTICATED_WITH_PROFILE" : "AUTHENTICATED_NO_PROFILE",
    );
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await getUserProfile();
      const userData = response.data?.user;

      if (userData) {
        updateUserState(userData);
      } else {
        updateUserState(null);
      }
    } catch {
      updateUserState(null);
    }
  }, [updateUserState]);

  const handleAuthAction = useCallback(
    async <T extends AuthResponse>(
      action: () => Promise<ApiResponse<T>>,
    ): Promise<ApiResponse<T>> => {
      try {
        const result = await action();
        console.log("Auth result:", { result });

        if (!result.success) {
          throw result;
        }

        if (result.data && (result.data as AuthResponse).accessToken) {
          storeAuthData(result.data as AuthResponse);
          updateUserState((result.data as AuthResponse).user);
        }
        return result;
      } catch (error) {
        clearAuthData();
        updateUserState(null);
        throw error;
      }
    },
    [updateUserState],
  );

  const handleSignOut = useCallback(async () => {
    try {
      await makeRequest("/auth/logout", "POST", { requireAuth: false });
    } catch (error) {
      console.warn("API logout failed:", error);
    } finally {
      clearAuthData();
      updateUserState(null);
    }
  }, [updateUserState]);

  const signUp = useCallback(
    (data: SignupData) => handleAuthAction(() => signUpWithEmail(data)),
    [handleAuthAction],
  );

  const signIn = useCallback(
    (data: SigninData) => handleAuthAction(() => signInWithEmail(data)),
    [handleAuthAction],
  );

  const googleSignIn = useCallback(
    (role: UserRole = UserRole.STUDENT) =>
      handleAuthAction(() => signInWithGoogle(role)),
    [handleAuthAction],
  );

  const handleRequestPasswordReset = useCallback(
    (email: string) => requestPasswordReset(email),
    [],
  );

  const handleCompletePasswordReset = useCallback(
    (token: string, data: any) => completePasswordReset(token, data),
    [],
  );

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const value: AuthContextValue = {
    profile,
    loading: authState === "LOADING",
    authState,
    isAuthenticated:
      authState === "AUTHENTICATED_WITH_PROFILE" ||
      authState === "AUTHENTICATED_NO_PROFILE",
    isCoach: profile?.role === "COACH",
    isStudent: profile?.role === "STUDENT",
    isAdmin: profile?.role === "ADMIN",
    refreshUser,
    signUp,
    signIn,
    signInWithGoogle: googleSignIn,
    signOut: handleSignOut,
    requestPasswordReset: handleRequestPasswordReset,
    completePasswordReset: handleCompletePasswordReset,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
