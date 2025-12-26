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

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentSignups = [], isLoading: signupsLoading } =
    useRecentSignups(5);
  const { data: platformActivity = [], isLoading: activityLoading } =
    usePlatformActivity(10);

  // Default stats for loading state
  const defaultStats = {
    revenue: { value: "$0", change: "+0% from last month" },
    users: { value: "0", change: "+0 from last month" },
    signups: { value: "+0", change: "+0% from last month" },
    coaches: { value: "0", change: "+0 since last month" },
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
