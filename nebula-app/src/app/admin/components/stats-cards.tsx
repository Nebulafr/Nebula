"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, UserPlus, Briefcase } from "lucide-react";

interface StatCardProps {
  title: string;
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

export function StatsCards({ stats, loading = false }: StatsCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mb-1" />
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Revenue"
        value={stats.revenue.value}
        change={stats.revenue.change}
        icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title="Total Users"
        value={stats.users.value}
        change={stats.users.change}
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title="New Sign-ups"
        value={stats.signups.value}
        change={stats.signups.change}
        icon={<UserPlus className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title="Active Coaches"
        value={stats.coaches.value}
        change={stats.coaches.change}
        icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  );
}