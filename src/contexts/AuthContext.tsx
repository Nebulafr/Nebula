"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useUser, UseUserReturn } from "@/hooks/use-user";
import {
  signUpWithEmail,
  signInWithEmail,
  resetPassword,
  type SignUpData,
} from "@/actions/auth";
import { UserRole } from "@/generated/prisma";
import { SignInData, signInWithGoogle } from "@/firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { publicRoutes } from "@/lib/utils";

export interface AuthContextValue extends UseUserReturn {
  signUp: (data: SignUpData) => Promise<{ accessToken: string; user: any }>;
  signIn: (data: SignInData) => Promise<{ accessToken: string; user: any }>;
  signInWithGoogle: (
    role?: UserRole
  ) => Promise<{ accessToken: string; user: any }>;
  resetPassword: (email: string) => Promise<void>;
  error: Error | null;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const userHook = useUser();
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isRedirecting = useRef(false);

  useEffect(() => {
    if (userHook.authState === "LOADING") return;

    if (isRedirecting.current) return;

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

    if (
      userHook.authState === "UNAUTHENTICATED" &&
      !isAuthPage &&
      !isPublicRoute
    ) {
      isRedirecting.current = true;
      router.replace("/login");
      setTimeout(() => {
        isRedirecting.current = false;
      }, 100);
      return;
    }

    if (
      userHook.authState === "AUTHENTICATED_NO_PROFILE" &&
      !isOnboardingPage &&
      !isAuthPage
    ) {
      isRedirecting.current = true;
      const target =
        userHook.profile?.role === "COACH"
          ? "/coach-onboarding/step-1"
          : "/onboarding/step-1";
      router.replace(target);
      setTimeout(() => {
        isRedirecting.current = false;
      }, 100);
      return;
    }

    if (
      userHook.authState === "AUTHENTICATED_WITH_PROFILE" &&
      (isAuthPage || isOnboardingPage)
    ) {
      isRedirecting.current = true;
      const target = getDashboardUrl(userHook.profile?.role);
      router.replace(target);
      setTimeout(() => {
        isRedirecting.current = false;
      }, 100);
    }
  }, [userHook.authState, userHook.profile, pathname, router]);

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

  const clearError = () => setError(null);

  const handleAuthAction = async <T,>(action: () => Promise<T>): Promise<T> => {
    try {
      setError(null);
      const result = await action();
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    }
  };

  const authActions = {
    signUp: (data: SignUpData) => handleAuthAction(() => signUpWithEmail(data)),
    signIn: (data: SignInData) => handleAuthAction(() => signInWithEmail(data)),
    signInWithGoogle: (role?: UserRole) =>
      handleAuthAction(() => signInWithGoogle(role)),
    resetPassword: (email: string) =>
      handleAuthAction(() => resetPassword(email)),
  };

  const value: AuthContextValue = {
    ...userHook,
    ...authActions,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
