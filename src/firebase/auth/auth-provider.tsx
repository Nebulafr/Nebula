'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { useUser, type UseUserReturn } from './use-user';
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signOut,
  resetPassword,
  updateUserPassword,
  updateUserProfile,
  handleGoogleRedirectResult,
  type SignUpData,
  type SignInData,
  type AuthError,
} from './auth-functions';

export interface AuthContextValue extends UseUserReturn {
  // Auth actions
  signUp: (data: SignUpData) => Promise<User>;
  signIn: (data: SignInData) => Promise<User>;
  signInWithGoogle: (role?: 'student' | 'coach') => Promise<User>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
  
  // Auth state
  error: AuthError | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const userHook = useUser();
  const [error, setError] = useState<AuthError | null>(null);

  const clearError = () => setError(null);

  // Handle Google redirect result on mount
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        await handleGoogleRedirectResult();
      } catch (error) {
        console.error('Error handling redirect:', error);
      }
    };
    handleRedirect();
  }, []);

  // Clear error when auth state changes
  useEffect(() => {
    if (userHook.user) {
      setError(null);
    }
  }, [userHook.user]);

  const handleAuthAction = async <T,>(action: () => Promise<T>): Promise<T> => {
    try {
      setError(null);
      return await action();
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      throw authError;
    }
  };

  const authActions = {
    signUp: (data: SignUpData) => handleAuthAction(() => signUpWithEmail(data)),
    signIn: (data: SignInData) => handleAuthAction(() => signInWithEmail(data)),
    signInWithGoogle: (role?: 'student' | 'coach') => handleAuthAction(() => signInWithGoogle(role)),
    signOut: () => handleAuthAction(() => signOut()),
    resetPassword: (email: string) => handleAuthAction(() => resetPassword(email)),
    updatePassword: (currentPassword: string, newPassword: string) => 
      handleAuthAction(() => updateUserPassword(currentPassword, newPassword)),
    updateProfile: (data: { displayName?: string; photoURL?: string }) => 
      handleAuthAction(() => updateUserProfile(data)),
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Convenience hooks for specific auth states
export function useAuthUser() {
  const { user, profile, loading } = useAuth();
  return { user, profile, loading };
}

export function useAuthState() {
  const { isAuthenticated, loading, authState } = useAuth();
  return { isAuthenticated, loading, authState };
}

export function useAuthActions() {
  const { 
    signUp, 
    signIn, 
    signInWithGoogle, 
    signOut, 
    resetPassword, 
    updatePassword, 
    updateProfile,
    error,
    clearError
  } = useAuth();
  
  return { 
    signUp, 
    signIn, 
    signInWithGoogle, 
    signOut, 
    resetPassword, 
    updatePassword, 
    updateProfile,
    error,
    clearError
  };
}