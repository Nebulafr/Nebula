"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "student" | "coach" | "admin";
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

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push(fallbackPath);
      return;
    }

    // If profile is required but user doesn't have one, redirect to onboarding
    if (requireProfile && authState === "AUTHENTICATED_NO_PROFILE") {
      const onboardingPath =
        profile?.role === "coach"
          ? "/coach-onboarding/step-1"
          : "/onboarding/step-1";
      router.push(onboardingPath);
      return;
    }

    // If specific role is required, check if user has that role
    if (requiredRole && profile?.role !== requiredRole) {
      // Redirect to appropriate dashboard or access denied page
      const redirectPath =
        profile?.role === "coach"
          ? "/coach-dashboard"
          : profile?.role === "admin"
          ? "/admin"
          : "/dashboard";
      router.push(redirectPath);
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

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render if redirecting
  if (
    !isAuthenticated ||
    (requireProfile && authState === "AUTHENTICATED_NO_PROFILE") ||
    (requiredRole && profile?.role !== requiredRole)
  ) {
    return null;
  }

  return <>{children}</>;
}

// Convenience components for specific roles
export function StudentRoute({
  children,
  ...props
}: Omit<ProtectedRouteProps, "requiredRole">) {
  return (
    <ProtectedRoute requiredRole="student" {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function CoachRoute({
  children,
  ...props
}: Omit<ProtectedRouteProps, "requiredRole">) {
  return (
    <ProtectedRoute requiredRole="coach" {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function AdminRoute({
  children,
  ...props
}: Omit<ProtectedRouteProps, "requiredRole">) {
  return (
    <ProtectedRoute requiredRole="admin" {...props}>
      {children}
    </ProtectedRoute>
  );
}
