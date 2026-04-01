"use client";

import { useTranslations } from "next-intl";

interface DashboardHeaderProps {
  title?: string;
  loading?: boolean;
}

export function DashboardHeader({ 
  title, 
  loading = false 
}: DashboardHeaderProps) {
  const t = useTranslations("common");
  const displayTitle = title || t("dashboard");
  if (loading) {
    return (
      <div className="flex items-center justify-between space-y-2">
        <div className="h-9 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between space-y-2">
      <h3 className="text-3xl font-bold tracking-tight">{displayTitle}</h3>
    </div>
  );
}