"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, Clock } from "lucide-react";

interface StudentsStats {
  total: number;
  active: number;
  completed: number;
  paused: number;
  cancelled?: number;
}

interface StudentsStatsProps {
  stats: StudentsStats;
  loading?: boolean;
}

export function StudentsStatsCards({ stats, loading = false }: StudentsStatsProps) {
  const statsConfig = [
    {
      title: "Total Students",
      value: stats.total,
      icon: Users,
      description: "All time",
    },
    {
      title: "Active Students", 
      value: stats.active,
      icon: UserCheck,
      description: "Currently enrolled",
    },
    {
      title: "Completed Programs",
      value: stats.completed,
      icon: UserX,
      description: "Finished training",
    },
    {
      title: "Paused/On Break",
      value: stats.paused,
      icon: Clock,
      description: "Temporarily paused",
    },
  ];

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
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsConfig.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <IconComponent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}