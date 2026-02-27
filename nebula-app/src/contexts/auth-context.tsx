
"use client";
import { createContext, useEffect, useState, useCallback } from "react";
import { storeAuthData, clearAuthData } from "@/lib/auth-storage";
import { makeRequest, publicRoutes } from "@/lib/utils";
import { UserRole } from "@/generated/prisma";
import { UserProfile, AuthState, AuthResponse, ApiResponse } from "@/types";
import { SignupData, SigninData } from "@/lib/validations";
import { getUserProfile } from "@/actions/user";
import {
  signUpWithEmail,
  signInWithEmail,
  requestPasswordReset,
  completePasswordReset,
} from "@/actions/auth";
import { signInWithGoogle as firebaseGoogleSignIn } from "@/firebase/auth";
import { useRouter, usePathname } from "next/navigation";



export interface AuthContextValue {
  profile: UserProfile | null;
  loading: boolean;
  authState: AuthState;
  isAuthenticated: boolean;
  isCoach: boolean;
  isStudent: boolean;
  isAdmin: boolean;
  refreshUser: () => Promise<void>;
  signUp: (data: SignupData) => Promise<AuthResponse>;
  signIn: (data: SigninData) => Promise<AuthResponse>;
  signInWithGoogle: (role?: UserRole) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<ApiResponse<any>>;
  completePasswordReset: (
    token: string,
    data: any,
  ) => Promise<ApiResponse<any>>;
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
  const pathname = usePathname();

  const isPublicRoute = useCallback((path: string) => {
    return publicRoutes.some(
      (route) => path === route || path.startsWith(`${route}/`),
    );
  }, []);

  const updateUserState = useCallback(
    (userData: UserProfile | null) => {
      setProfile(userData);

      if (!userData) {
        setAuthState("UNAUTHENTICATED");
        if (!isPublicRoute(pathname)) {
          router.push("/login");
        }
        return;
      }

      const hasProfile =
        userData.role === "ADMIN" || userData.coach || userData.student;
      setAuthState(
        hasProfile ? "AUTHENTICATED_WITH_PROFILE" : "AUTHENTICATED_NO_PROFILE",
      );
    },
    [pathname, router, isPublicRoute],
  );

  const refreshUser = useCallback(async () => {
    try {
      const data = await getUserProfile();
      const userData = data.user;

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
      action: () => Promise<T>,
    ): Promise<T> => {
      try {
        const result = await action();
        console.log("Auth result:", { result });

        if (result && result.accessToken) {
          storeAuthData(result);
          updateUserState(result.user);
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
      handleAuthAction(() => firebaseGoogleSignIn(role)),
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
