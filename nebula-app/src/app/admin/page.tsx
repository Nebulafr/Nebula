"use client";

import { DashboardHeader } from "./components/dashboard-header";
import { StatsCards } from "./components/stats-cards";
import { RecentSignups } from "./components/recent-signups";
import { PlatformOverview } from "./components/platform-overview";
import {
  useDashboardStats,
  useRecentSignups,
  usePlatformActivity,
} from "@/hooks/use-admin-queries";
import { useTranslations } from "next-intl";

export default function AdminDashboardPage() {
  const t = useTranslations("dashboard.admin");
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentSignups = [], isLoading: signupsLoading } =
    useRecentSignups(5);
  const { data: platformActivity = [], isLoading: activityLoading } =
    usePlatformActivity(5);

  // Default stats for loading state
  const defaultStats = {
    revenue: { value: "$0", change: t("fromLastMonthShort", { change: "0" }) },
    users: { value: "0", change: t("fromLastMonthShort", { change: "0" }) },
    signups: { value: "+0", change: t("fromLastMonthShort", { change: "0" }) },
    coaches: { value: "0", change: t("sinceLastMonthShort", { count: "0" }) },
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <DashboardHeader />
      <StatsCards stats={stats || defaultStats} loading={statsLoading} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <RecentSignups signups={recentSignups} loading={signupsLoading} />
        <PlatformOverview
          activities={platformActivity}
          loading={activityLoading}
        />
      </div>
    </div>
  );
}
