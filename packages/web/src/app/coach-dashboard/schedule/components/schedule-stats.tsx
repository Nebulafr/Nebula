"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  Users,
  Star,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export interface CoachStatsData {
  totalRevenue?: number;
  revenueChange?: number;
  activeStudents?: number;
  studentsChange?: number;
  sessionsThisMonth?: number;
  sessionsChange?: number;
  averageRating?: number;
  totalReviews?: number;
  totalSessions?: number;
  studentsCoached?: number;
}

interface ScheduleStatsProps {
  stats: CoachStatsData;
  loading?: boolean;
}

export function ScheduleStats({ stats, loading = false }: ScheduleStatsProps) {
  const t = useTranslations("dashboard.coach.schedule.stats");

  const statsConfig = [
    {
      title: t("sessionsThisMonth"),
      value: stats.sessionsThisMonth ?? 0,
      change: stats.sessionsChange,
      icon: Calendar,
      format: (v: number) => v.toString(),
    },
    {
      title: t("activeStudents"),
      value: stats.activeStudents ?? 0,
      change: stats.studentsChange,
      icon: Users,
      format: (v: number) => v.toString(),
    },
    {
      title: t("totalSessions"),
      value: stats.totalSessions ?? 0,
      icon: Clock,
      format: (v: number) => v.toString(),
    },
    {
      title: t("averageRating"),
      value: stats.averageRating ?? 0,
      icon: Star,
      format: (v: number) => v.toFixed(1),
      suffix: stats.totalReviews ? t("reviewsCount", { count: stats.totalReviews }) : "",
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-4 w-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded animate-pulse mb-2" />
              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
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
        const hasChange = stat.change !== undefined && stat.change !== 0;
        const isPositive = (stat.change ?? 0) > 0;

        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <IconComponent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.format(stat.value)}
              </div>
              <div className="flex items-center gap-1">
                {hasChange && (
                  <span
                    className={cn(
                      "text-xs flex items-center",
                      isPositive ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3 mr-0.5" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-0.5" />
                    )}
                    {Math.abs(stat.change ?? 0).toFixed(1)}%
                  </span>
                )}
                {stat.suffix && (
                  <span className="text-xs text-muted-foreground">
                    {stat.suffix}
                  </span>
                )}
                {!hasChange && !stat.suffix && (
                  <span className="text-xs text-muted-foreground">
                    {t("vsLastMonth")}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
