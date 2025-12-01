"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Star, TrendingUp } from "lucide-react";

interface ProgramsStats {
  totalPrograms: number;
  activePrograms: number;
  totalEnrollments: number;
  averageRating: number;
  monthlyRevenue?: number;
}

interface ProgramsStatsProps {
  stats: ProgramsStats;
  loading?: boolean;
}

export function ProgramsStatsCards({ stats, loading = false }: ProgramsStatsProps) {
  const statsConfig = [
    {
      title: "Total Programs",
      value: stats.totalPrograms,
      icon: BookOpen,
      description: "All programs",
    },
    {
      title: "Active Programs", 
      value: stats.activePrograms,
      icon: TrendingUp,
      description: "Currently available",
    },
    {
      title: "Total Enrollments",
      value: stats.totalEnrollments,
      icon: Users,
      description: "Across all programs",
    },
    {
      title: "Average Rating",
      value: stats.averageRating.toFixed(1),
      icon: Star,
      description: "From student reviews",
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