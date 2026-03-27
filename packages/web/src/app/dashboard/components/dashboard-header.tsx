"use client";

import { UserProfile } from "@/types";
import { useTranslations } from "next-intl";

interface DashboardHeaderProps {
  user: UserProfile | null;
  loading?: boolean;
}

export function DashboardHeader({
  user,
  loading = false,
}: DashboardHeaderProps) {
  const t = useTranslations("dashboard");
  const tc = useTranslations("dashboard.coach");

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
        {t("welcome", { name: user?.fullName || tc("student") })}
      </h3>
    </div>
  );
}
