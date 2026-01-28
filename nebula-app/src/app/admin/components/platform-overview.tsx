"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Briefcase, UserPlus, Users, TrendingUp, AlertCircle } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";

interface PlatformActivity {
  type: string;
  action?: string;
  description: string;
  module?: string;
  user?: string;
  createdAt: string;
  time?: string;
}

interface PlatformOverviewProps {
  activities: any[]; // Changed to any to be safe with incoming data
  loading?: boolean;
}

function ActivityIcon({ type }: { type: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    "New Coach": <Briefcase className="h-5 w-5 text-muted-foreground" />,
    "New Program": <UserPlus className="h-5 w-5 text-muted-foreground" />,
    "New Student": <Users className="h-5 w-5 text-muted-foreground" />,
    "Revenue": <TrendingUp className="h-5 w-5 text-muted-foreground" />,
    "Alert": <AlertCircle className="h-5 w-5 text-muted-foreground" />,
  };

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
      {iconMap[type] || <Users className="h-5 w-5 text-muted-foreground" />}
    </div>
  );
}

export function PlatformOverview({ activities, loading = false }: PlatformOverviewProps) {
  const t = useTranslations("dashboard.admin");
  const locale = useLocale();
  const dateLocale = locale === "fr" ? fr : enUS;

  if (loading) {
    return (
      <Card className="col-span-4 lg:col-span-3">
        <CardHeader>
          <CardTitle>{t("platformOverview")}</CardTitle>
          <CardDescription>{t("recentPlatformActivity")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start">
                <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse" />
                <div className="ml-4 space-y-1 flex-1">
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-4 lg:col-span-3">
      <CardHeader>
        <CardTitle>{t("platformOverview")}</CardTitle>
        <CardDescription>{t("recentPlatformActivity")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("action")}</TableHead>
              <TableHead>{t("module")}</TableHead>
              <TableHead>{t("user")}</TableHead>
              <TableHead className="text-right">{t("time")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <ActivityIcon type={activity.type} />
                      <span className="ml-3">{activity.action || activity.description}</span>
                    </div>
                  </TableCell>
                  <TableCell>{activity.module || "N/A"}</TableCell>
                  <TableCell>{activity.user || "N/A"}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.createdAt), {
                      addSuffix: true,
                      locale: dateLocale,
                    })}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground"
                >
                  {t("noPlatformActivity")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}