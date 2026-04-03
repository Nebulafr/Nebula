
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, GraduationCap } from "lucide-react";
import { useTranslations } from "next-intl";

interface StatCardProps {
  title: React.ReactNode;
  value: string;
  change: string;
  icon: React.ReactNode;
  changeType?: 'positive' | 'negative' | 'neutral';
}
function StatCard({ title, value, change, icon, changeType = 'positive' }: StatCardProps) {
  const changeColor = changeType === 'positive' ? 'text-green-600' :
    changeType === 'negative' ? 'text-red-600' :
      'text-muted-foreground';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${changeColor}`}>{change}</p>
      </CardContent>
    </Card>
  );
}

interface StatsCardsProps {
  stats: {
    revenue: { value: string; change: string };
    users: { value: string; change: string };
    activeStudents: { value: string; change: string };
    coaches: { value: string; change: string };
  };
  loading?: boolean;
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  const t = useTranslations("dashboard.coach");
  const tc = useTranslations("common");
  const td = useTranslations("dashboard.admin");

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-4 w-4 bg-gray-200 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-32 bg-gray-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title={td("totalRevenue")}
        value={stats.revenue.value}
        change={stats.revenue.change}
        icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title={td("users")}
        value={stats.users.value}
        change={stats.users.change}
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title={td("activeStudents")}
        value={stats.activeStudents.value}
        change={stats.activeStudents.change}
        icon={<GraduationCap className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title={td("activeCoaches")}
        value={stats.coaches.value}
        change={stats.coaches.change}
        icon={<GraduationCap className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  );
}