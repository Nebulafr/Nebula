"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser, type UseUserReturn } from "../hooks/use-user";
import {
  signUpWithEmail,
  signUpWithGoogle,
  handleGoogleRedirectResult,
  type SignUpData,
  signInWithEmail,
  resetPassword,
} from "../actions/auth";
import { UserRole } from "@/generated/prisma";
import { SignInData, signInWithGoogle } from "@/firebase/auth";

export interface AuthContextValue extends UseUserReturn {
  signUp: (data: SignUpData) => Promise<{ accessToken: string; user: any }>;
  signIn: (data: SignInData) => Promise<{ accessToken: string; user: any }>;
  signInWithGoogle: (
    role?: UserRole
  ) => Promise<{ accessToken: string; user: any }>;
  resetPassword: (email: string) => Promise<void>;
  error: Error | null;
  clearError: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const userHook = useUser();
  const [error, setError] = useState<Error | null>(null);

  const clearError = () => setError(null);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        await handleGoogleRedirectResult();
      } catch (error) {
        console.error("Error handling redirect:", error);
      }
    };
    handleRedirect();
  }, []);

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
    signUpWithGoogle: (role?: UserRole) =>
      handleAuthAction(() => signUpWithGoogle(role)),
    resetPassword: (email: string) => handleAuthAction(() => resetPassword(email)),
  };

  const value: AuthContextValue = {
    ...userHook,
    ...authActions,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useAuthUser() {
  const { user, profile, loading, ...rest } = useAuth();
  return { user, profile, loading, rest };
}

export function useAuthState() {
  const { isAuthenticated, loading, authState } = useAuth();
  return { isAuthenticated, loading, authState };
}

export function useAuthActions() {
  const { signUp, signIn, signInWithGoogle, resetPassword, logout, error, clearError } =
    useAuth();

  return {
    signUp,
    signIn,
    signInWithGoogle,
    resetPassword,
    logout,
    error,
    clearError,
  };
}
