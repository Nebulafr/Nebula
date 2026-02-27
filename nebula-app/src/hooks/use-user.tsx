"use client";

import { useAuth } from "./use-auth";
import { Coach, Student } from "@/generated/prisma";
import { UserProfile, AuthState } from "@/types";

export interface UseUserReturn {
  profile: UserProfile | null;
  coachProfile: Coach | null;
  studentProfile: Student | null;
  loading: boolean;
  authState: AuthState;
  isAuthenticated: boolean;
  isCoach: boolean;
  isStudent: boolean;
  isAdmin: boolean;
  refreshUser: () => void;
}

export function useUser(): UseUserReturn {
  const {
    profile,
    authState,
    isAuthenticated,
    loading,
    isCoach,
    isStudent,
    isAdmin,
    refreshUser,
  } = useAuth();

  return {
    profile,
    coachProfile: profile?.coach || null,
    studentProfile: profile?.student || null,
    loading,
    authState,
    isAuthenticated,
    isCoach,
    isStudent,
    isAdmin,
    refreshUser,
  };
}
