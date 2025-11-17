"use client";

import { useEffect, useState, useRef } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, onSnapshot, Unsubscribe } from "firebase/firestore";
import { useRouter, usePathname } from "next/navigation";
import type { IUser, ICoach, IStudent } from "@/models";
import { auth, db } from "@/firebase/client";
import { publicRoutes } from "@/lib/utils";

type AuthState =
  | "LOADING"
  | "UNAUTHENTICATED"
  | "AUTHENTICATED_NO_PROFILE"
  | "AUTHENTICATED_WITH_PROFILE";

export interface UseUserReturn {
  user: User | null;
  profile: IUser | null;
  coachProfile: ICoach | null;
  studentProfile: IStudent | null;
  loading: boolean;
  authState: AuthState;
  isAuthenticated: boolean;
  isCoach: boolean;
  isStudent: boolean;
  isAdmin: boolean;
}

export function useUser(): UseUserReturn {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<IUser | null>(null);
  const [coachProfile, setCoachProfile] = useState<ICoach | null>(null);
  const [studentProfile, setStudentProfile] = useState<IStudent | null>(null);
  const [authState, setAuthState] = useState<AuthState>("LOADING");

  const isRedirecting = useRef(false);
  const unsubscribeRoleRef = useRef<Unsubscribe | undefined>();

  // MAIN AUTH LISTENER
  useEffect(() => {
    if (!auth || !db) return;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("Auth state changed:", { user: firebaseUser });

      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        // User logged out - clean up everything
        setUser(null);
        setProfile(null);
        setCoachProfile(null);
        setStudentProfile(null);
        setAuthState("UNAUTHENTICATED");

        // Clean up role listener if it exists
        if (unsubscribeRoleRef.current) {
          unsubscribeRoleRef.current();
          unsubscribeRoleRef.current = undefined;
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeRoleRef.current) {
        unsubscribeRoleRef.current();
      }
    };
  }, []); // Empty dependency array - only run once

  // PROFILE LISTENER (runs when user changes)
  useEffect(() => {
    if (!user || !db) return;

    const userRef = doc(db, "users", user.uid);

    const unsubscribeProfile = onSnapshot(
      userRef,
      (userDoc) => {
        if (userDoc.exists()) {
          const userData = userDoc.data() as IUser;
          setProfile(userData);

          // Clean up previous role listener if it exists
          if (unsubscribeRoleRef.current) {
            unsubscribeRoleRef.current();
            unsubscribeRoleRef.current = undefined;
          }

          // Set up role-specific listener if needed
          if (userData.role === "student" || userData.role === "coach") {
            const roleCollection =
              userData.role === "student" ? "students" : "coaches";
            const roleRef = doc(db, roleCollection, user.uid);

            unsubscribeRoleRef.current = onSnapshot(
              roleRef,
              (roleDoc) => {
                if (roleDoc.exists()) {
                  if (userData.role === "student") {
                    setStudentProfile(roleDoc.data() as IStudent);
                    setCoachProfile(null);
                  } else if (userData.role === "coach") {
                    setCoachProfile(roleDoc.data() as ICoach);
                    setStudentProfile(null);
                  }
                  setAuthState("AUTHENTICATED_WITH_PROFILE");
                } else {
                  // Role document doesn't exist yet (needs onboarding)
                  if (userData.role === "student") {
                    setStudentProfile(null);
                  } else if (userData.role === "coach") {
                    setCoachProfile(null);
                  }
                  setAuthState("AUTHENTICATED_NO_PROFILE");
                }
              },
              (error) => {
                console.error(
                  `Error on ${userData.role} profile snapshot:`,
                  error
                );
                const errCode = (error as any)?.code;

                if (
                  errCode === "permission-denied" ||
                  errCode === "missing-or-insufficient-permissions"
                ) {
                  console.log(
                    `${userData.role} profile doesn't exist yet, setting NO_PROFILE state`
                  );
                  if (userData.role === "student") {
                    setStudentProfile(null);
                  } else if (userData.role === "coach") {
                    setCoachProfile(null);
                  }
                  setAuthState("AUTHENTICATED_NO_PROFILE");
                } else {
                  // Other errors - keep current state but log
                  console.error("Unexpected error on role profile:", error);
                }
              }
            );
          } else {
            setCoachProfile(null);
            setStudentProfile(null);
            setAuthState("AUTHENTICATED_WITH_PROFILE");
          }
        } else {
          setProfile(null);
          setCoachProfile(null);
          setStudentProfile(null);
          setAuthState("AUTHENTICATED_NO_PROFILE");
        }
      },
      (error) => {
        console.error("Error on user profile snapshot:", error);
        const errCode = (error as any)?.code;

        if (
          errCode === "permission-denied" ||
          errCode === "missing-or-insufficient-permissions"
        ) {
          setProfile(null);
          setAuthState("AUTHENTICATED_NO_PROFILE");
        } else {
          setAuthState("UNAUTHENTICATED");
        }
      }
    );

    return () => {
      unsubscribeProfile();
      if (unsubscribeRoleRef.current) {
        unsubscribeRoleRef.current();
        unsubscribeRoleRef.current = undefined;
      }
    };
  }, [user]);

  useEffect(() => {
    if (authState === "LOADING") return;

    const isAuthPage =
      pathname.startsWith("/login") ||
      pathname.startsWith("/signup") ||
      pathname.startsWith("/coach-login") ||
      pathname.startsWith("/coach-signup");

    if (isRedirecting.current) {
      const timer = setTimeout(() => {
        isRedirecting.current = false;
      }, 100);
      return () => clearTimeout(timer);
    }

    if (isRedirecting.current) return;

    if (authState === "AUTHENTICATED_NO_PROFILE" && profile) {
      const onboardingUrl =
        profile.role === "coach"
          ? "/coach-onboarding/step-1"
          : "/onboarding/step-1";

      if (
        !pathname.startsWith("/onboarding") &&
        !pathname.startsWith("/coach-onboarding")
      ) {
        console.log("Redirecting to onboarding:", onboardingUrl);
        isRedirecting.current = true;
        router.push(onboardingUrl);
      }
    }
    // Redirect to dashboard if on auth page with complete profile
    else if (authState === "AUTHENTICATED_WITH_PROFILE" && isAuthPage) {
      const dashboardUrl =
        profile?.role === "coach" ? "/coach-dashboard" : "/dashboard";
      console.log("Redirecting to dashboard:", dashboardUrl);
      isRedirecting.current = true;
      router.push(dashboardUrl);
    }
    // Redirect to login if unauthenticated and not on auth page
    else if (authState === "UNAUTHENTICATED" && !isAuthPage) {
      // Optional: Add public routes that don't require auth
      if (!publicRoutes.includes(pathname)) {
        console.log("Redirecting to login");
        isRedirecting.current = true;
        router.push("/login");
      }
    }
  }, [authState, profile, pathname, router]);

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
    isCoach: profile?.role === "coach",
    isStudent: profile?.role === "student",
    isAdmin: profile?.role === "admin",
  };
}
