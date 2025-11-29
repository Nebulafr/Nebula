// hooks/use-user.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Coach, Student, User } from "@/generated/prisma";
import { getStoredUserData, storeAuthData } from "@/lib/auth-storage";

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
  refreshUser: () => Promise<void>;
}

export function useUser(): UseUserReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [coachProfile, setCoachProfile] = useState<Coach | null>(null);
  const [studentProfile, setStudentProfile] = useState<Student | null>(null);
  const [authState, setAuthState] = useState<AuthState>("LOADING");

  const fetchUserProfile = useCallback(async () => {
    try {
      const userData = getStoredUserData();

      console.log({ userData });

      if (!userData) {
        setProfile(null);
        setCoachProfile(null);
        setStudentProfile(null);
        setAuthState("UNAUTHENTICATED");
        return;
      }

      setProfile(userData);
      setCoachProfile(userData.coach || null);
      setStudentProfile(userData.student || null);

      const hasProfile =
        userData.role === "ADMIN" || userData.coach || userData.student;

      setAuthState(
        hasProfile ? "AUTHENTICATED_WITH_PROFILE" : "AUTHENTICATED_NO_PROFILE"
      );
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setProfile(null);
      setCoachProfile(null);
      setStudentProfile(null);
      setAuthState("UNAUTHENTICATED");
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const isAuthenticated =
    authState === "AUTHENTICATED_WITH_PROFILE" ||
    authState === "AUTHENTICATED_NO_PROFILE";

  const isCoach = profile?.role === "COACH";
  const isStudent = profile?.role === "STUDENT";
  const isAdmin = profile?.role === "ADMIN";

  return {
    profile,
    coachProfile,
    studentProfile,
    loading: authState === "LOADING",
    authState,
    isAuthenticated,
    isCoach,
    isStudent,
    isAdmin,
    refreshUser: fetchUserProfile,
  };
}
