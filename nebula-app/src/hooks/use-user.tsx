// hooks/use-user.tsx
"use client";

import { useAuth } from "./use-auth";
import { Coach, Student, User } from "@/generated/prisma";

export type AuthState =
  | "LOADING"
  | "UNAUTHENTICATED"
  | "AUTHENTICATED_NO_PROFILE"
  | "AUTHENTICATED_WITH_PROFILE";

export interface UserProfile extends User {
  coach: Coach | null;
  student: Student | null;
}
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
