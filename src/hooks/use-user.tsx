"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Coach, Student, User } from "@/generated/prisma";
import { getUserProfile } from "@/actions/user";
import { signOut } from "@/firebase/auth";
import { publicRoutes } from "@/lib/utils";

type AuthState =
  | "LOADING"
  | "UNAUTHENTICATED"
  | "AUTHENTICATED_NO_PROFILE"
  | "AUTHENTICATED_WITH_PROFILE";

export interface UseUserReturn {
  user: any | null;
  profile: User | null;
  coachProfile: Coach | null;
  studentProfile: Student | null;
  loading: boolean;
  authState: AuthState;
  isAuthenticated: boolean;
  isCoach: boolean;
  isStudent: boolean;
  isAdmin: boolean;
  refreshUser: () => void;
  setAccessToken: (token: string, userData: any) => void;
  clearAuth: () => void;
  logout: () => Promise<void>;
}

export function useUser(): UseUserReturn {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [coachProfile, setCoachProfile] = useState<Coach | null>(null);
  const [studentProfile, setStudentProfile] = useState<Student | null>(null);
  const [authState, setAuthState] = useState<AuthState>("LOADING");

  const isRedirecting = useRef(false);

  const fetchUserProfile = async () => {
    try {
      const accessToken =
        typeof window !== undefined
          ? localStorage.getItem("accessToken")
          : null;

      if (!accessToken) {
        setUser(null);
        setProfile(null);
        setCoachProfile(null);
        setStudentProfile(null);
        setAuthState("UNAUTHENTICATED");
      }

      const response = await getUserProfile();

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch profile");
      }

      const userData = response.data?.user;

      console.log({ userData });

      if (!userData) {
        throw new Error("No user data received");
      }

      setUser(userData);
      setProfile(userData);
      setCoachProfile(userData.coach || null);
      setStudentProfile(userData.student || null);
      const hasProfile =
        userData.role === "ADMIN" || userData.coach || userData.student;

      setAuthState(
        hasProfile ? "AUTHENTICATED_WITH_PROFILE" : "AUTHENTICATED_NO_PROFILE"
      );
    } catch (error: any) {
      console.error("Error fetching user profile:", error);
      setUser(null);
      setProfile(null);
      setCoachProfile(null);
      setStudentProfile(null);
      setAuthState("UNAUTHENTICATED");
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);
  useEffect(() => {
    if (authState === "LOADING") return;

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

    if (
      authState === "UNAUTHENTICATED" &&
      !isAuthPage &&
      !publicRoutes.includes(pathname)
    ) {
      isRedirecting.current = true;
      router.replace("/login");
      return;
    }

    // AUTHENTICATED but NO PROFILE
    if (
      authState === "AUTHENTICATED_NO_PROFILE" &&
      isAuthPage &&
      !isOnboardingPage
    ) {
      isRedirecting.current = true;
      const target =
        profile?.role === "COACH"
          ? "/coach-onboarding/step-1"
          : "/onboarding/step-1";
      router.replace(target);
      return;
    }

    if (
      authState === "AUTHENTICATED_WITH_PROFILE" &&
      (isAuthPage || isOnboardingPage)
    ) {
      isRedirecting.current = true;
      const target =
        profile?.role === "COACH"
          ? "/coach-dashboard"
          : profile?.role === "ADMIN"
          ? "/admin"
          : "/dashboard";
      router.replace(target);
    }
  }, [authState, profile, pathname, router]);

  const setAccessToken = (token: string, userData: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", token);
    }
    setAuthState("LOADING");
    setUser({ accessToken: token, ...userData });
    fetchUserProfile();
  };

  const clearAuth = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
    }
    setUser(null);
    setProfile(null);
    setCoachProfile(null);
    setStudentProfile(null);
    setAuthState("UNAUTHENTICATED");
    isRedirecting.current = false;
  };

  const logout = async () => {
    try {
      await signOut();
      clearAuth();
    } catch (error: any) {
      console.error("Logout error:", error);
      clearAuth();
    }
  };

  return {
    user,
    profile,
    coachProfile,
    studentProfile,
    loading: authState === "LOADING",
    authState,
    isAuthenticated:
      authState === "AUTHENTICATED_WITH_PROFILE" ||
      authState === "AUTHENTICATED_NO_PROFILE",
    isCoach: profile?.role === "COACH",
    isStudent: profile?.role === "STUDENT",
    isAdmin: profile?.role === "ADMIN",
    refreshUser: () => fetchUserProfile(),
    setAccessToken,
    clearAuth,
    logout,
  };
}
