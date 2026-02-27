 
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, UserPlus, GraduationCap, Loader2 } from "lucide-react";
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
    signups: { value: string; change: string };
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("totalRevenue")}</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.revenue.value}</div>
          <p className="text-xs text-muted-foreground">
            {t("fromLastMonth", { change: stats.revenue.change.split("%")[0].replace("+", "") })}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{tc("users")}</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.users.value}</div>
          <p className="text-xs text-muted-foreground">
            {t("fromLastMonth", { change: stats.users.change.split(" ")[0].replace("+", "") })}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{td("signups")}</CardTitle>
          <UserPlus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.signups.value}</div>
          <p className="text-xs text-muted-foreground">
            {t("fromLastMonth", { change: stats.signups.change.split("%")[0].replace("+", "") })}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {tc("activeCoaches")}
          </CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.coaches.value}</div>
          <p className="text-xs text-muted-foreground">
            {t("sinceLastMonth", { count: stats.coaches.change.split(" ")[0].replace("+", "") })}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}