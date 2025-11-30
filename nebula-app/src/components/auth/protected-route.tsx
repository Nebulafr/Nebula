"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/generated/prisma";
import { useAuth } from "@/hooks/use-auth";
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requireProfile?: boolean;
  fallbackPath?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requireProfile = true,
  fallbackPath = "/login",
}: ProtectedRouteProps) {
  const { loading, isAuthenticated, profile, authState } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace(fallbackPath);
      return;
    }

    if (requireProfile && authState === "AUTHENTICATED_NO_PROFILE") {
      const onboardingPath = "/onboarding/step-1";
      router.replace(onboardingPath);
      return;
    }

    if (requiredRole && profile?.role !== requiredRole) {
      const redirectPath =
        profile?.role === UserRole.COACH
          ? "/coach-dashboard"
          : profile?.role === UserRole.ADMIN
          ? "/admin"
          : "/dashboard";
      router.replace(redirectPath);
      return;
    }
  }, [
    loading,
    isAuthenticated,
    profile,
    authState,
    requiredRole,
    requireProfile,
    fallbackPath,
    router,
  ]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (
    !isAuthenticated ||
    (requireProfile && authState === "AUTHENTICATED_NO_PROFILE") ||
    (requiredRole && profile?.role !== requiredRole)
  ) {
    return null;
  }

  return <>{children}</>;
}

export function StudentRoute({
  children,
  ...props
}: Omit<ProtectedRouteProps, "requiredRole">) {
  return (
    <ProtectedRoute requiredRole={UserRole.STUDENT} {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function CoachRoute({
  children,
  ...props
}: Omit<ProtectedRouteProps, "requiredRole">) {
  return (
    <ProtectedRoute requiredRole={UserRole.COACH} {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function AdminRoute({
  children,
  ...props
}: Omit<ProtectedRouteProps, "requiredRole">) {
  return (
    <ProtectedRoute requiredRole={UserRole.ADMIN} {...props}>
      {children}
    </ProtectedRoute>
  );
}

// Component to redirect authenticated users away from auth pages
export function AuthPageGuard({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated, profile, authState } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (isAuthenticated) {
      // If user has profile, redirect to appropriate dashboard
      if (authState === "AUTHENTICATED_WITH_PROFILE") {
        const dashboardPath =
          profile?.role === UserRole.COACH
            ? "/coach-dashboard"
            : profile?.role === UserRole.ADMIN
            ? "/admin"
            : "/dashboard";
        router.replace(dashboardPath);
        return;
      }

      // If user has no profile, redirect to onboarding
      if (authState === "AUTHENTICATED_NO_PROFILE") {
        const onboardingPath =
          profile?.role === "COACH"
            ? "/coach-onboarding/step-1"
            : "/onboarding/step-1";
        router.replace(onboardingPath);
        return;
      }
    }
  }, [loading, isAuthenticated, profile, authState, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only show auth pages if user is not authenticated
  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
