"use client";

import { UserProfile } from "@/hooks/use-user";

interface DashboardHeaderProps {
  user: UserProfile | null;
  loading?: boolean;
}

export function DashboardHeader({
  user,
  loading = false,
}: DashboardHeaderProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-between space-y-2">
        <div className="h-9 w-96 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between space-y-2">
      <h3 className="text-3xl font-bold tracking-tight">
        Welcome back, {user?.fullName || "Student"}!
      </h3>
    </div>
  );
}
