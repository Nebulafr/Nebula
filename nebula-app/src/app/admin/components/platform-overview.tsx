"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Briefcase, UserPlus, Users, TrendingUp, AlertCircle } from "lucide-react";

interface PlatformActivity {
  type: string;
  description: string;
  time: string;
  icon?: string;
}

interface PlatformOverviewProps {
  activities: PlatformActivity[];
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
  if (loading) {
    return (
      <Card className="col-span-4 lg:col-span-3">
        <CardHeader>
          <CardTitle>Platform Overview</CardTitle>
          <CardDescription>Recent platform-wide activity.</CardDescription>
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
        <CardTitle>Platform Overview</CardTitle>
        <CardDescription>Recent platform-wide activity.</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p>No recent activity to display.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-start">
                <ActivityIcon type={activity.type} />
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.description}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}