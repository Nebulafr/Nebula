"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  getStoredUserData,
  storeAuthData,
  clearAuthData,
} from "@/lib/auth-storage";
import {
  signUpWithEmail as apiSignUpWithEmail,
  signInWithEmail as apiSignInWithEmail,
  resetPassword as apiResetPassword,
  SignUpData,
} from "@/actions/auth";
import {
  signInWithGoogle as firebaseSignInWithGoogle,
  signOut as firebaseSignOut,
  SignInData,
} from "@/firebase/auth";
import { UserRole } from "@/generated/prisma";
import { usePathname, useRouter } from "next/navigation";
import { publicRoutes } from "@/lib/utils";
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
  const pathname = usePathname();
  const isRedirecting = useRef(false);

  const updateUserState = useCallback((userData: UserProfile | null) => {
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
      updateUserState(userData!);
    } catch (error) {
      console.error("Error refreshing user profile:", error);
      updateUserState(null);
    }
  }, [updateUserState]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (authState === "LOADING" || isRedirecting.current) return;

    const isAuthPage = [
      "/login",
      "/signup",
      "/coach-login",
      "/coach-signup",
    ].some((p) => pathname.startsWith(p));

    const isOnboardingPage =
      pathname.startsWith("/onboarding") ||
      pathname.startsWith("/coach-onboarding");

    const isPublicRoute = publicRoutes.includes(pathname);

    if (authState === "UNAUTHENTICATED" && !isAuthPage && !isPublicRoute) {
      isRedirecting.current = true;
      router.replace("/login");
      setTimeout(() => (isRedirecting.current = false), 100);
      return;
    }

    if (
      authState === "AUTHENTICATED_NO_PROFILE" &&
      !isOnboardingPage &&
      !isAuthPage
    ) {
      isRedirecting.current = true;
      const target =
        profile?.role === "COACH"
          ? "/coach-onboarding/step-1"
          : "/onboarding/step-1";
      router.replace(target);
      setTimeout(() => (isRedirecting.current = false), 100);
      return;
    }

    if (
      authState === "AUTHENTICATED_WITH_PROFILE" &&
      (isAuthPage || isOnboardingPage)
    ) {
      isRedirecting.current = true;
      const target = getDashboardUrl(profile?.role);
      router.replace(target);
      setTimeout(() => (isRedirecting.current = false), 100);
    }
  }, [authState, profile, pathname, router]);

  function getDashboardUrl(role?: string): string {
    switch (role) {
      case "COACH":
        return "/coach-dashboard";
      case "ADMIN":
        return "/admin";
      case "STUDENT":
      default:
        return "/dashboard";
    }
  }

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
      await firebaseSignOut();
    } catch (error) {
      console.error("Error signing out from Firebase:", error);
    } finally {
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
