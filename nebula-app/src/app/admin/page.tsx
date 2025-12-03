"use client";

import { DashboardHeader } from "./components/dashboard-header";
import { StatsCards } from "./components/stats-cards";
import { RecentSignups } from "./components/recent-signups";
import { PlatformOverview } from "./components/platform-overview";

const recentSignups = [
  {
    name: "Jessica L.",
    email: "jessica.l@example.com",
    avatar: "https://i.pravatar.cc/40?u=jessica",
    role: "Student",
  },
  {
    name: "Michael B. Jordan",
    email: "michael.jordan@example.com",
    avatar: "https://i.pravatar.cc/40?u=michael-b-jordan",
    role: "Coach",
  },
  {
    name: "Emily R.",
    email: "emily.r@example.com",
    avatar: "https://i.pravatar.cc/40?u=emily",
    role: "Student",
  },
];

const platformActivity = [
  {
    type: "New Coach",
    description: "Adrian Cucurella has been approved as a new coach.",
    time: "5m ago",
  },
  {
    type: "New Program",
    description: 'A new program "Advanced System Design" was created.',
    time: "1h ago",
  },
  {
    type: "New Student",
    description: "Jessica L. signed up as a new student.",
    time: "2h ago",
  },
];

const statsData = {
  revenue: { value: "$231,231.89", change: "+15.2% from last month" },
  users: { value: "5,231", change: "+120 from last month" },
  signups: { value: "+573", change: "+30.1% from last month" },
  coaches: { value: "73", change: "+5 since last month" },
};

export default function AdminDashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <DashboardHeader />
      <StatsCards stats={statsData} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <RecentSignups signups={recentSignups} />
        <PlatformOverview activities={platformActivity} />
      </div>
    </div>
  );
}
