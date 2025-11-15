"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  RecommendedPrograms,
  UpcomingSessions,
  SuggestedCoaches,
} from "./components";
import { StudentRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/context/auth-context";

export default function DashboardPage() {
  const { profile } = useAuth();

  return (
    <StudentRoute>
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h3 className="text-3xl font-bold tracking-tight">
            Welcome back, {profile?.fullName || "Student"}!
          </h3>
        </div>
        <div className="flex flex-col gap-[90px] mt-6">
          <RecommendedPrograms />
          <UpcomingSessions />
          <SuggestedCoaches />
        </div>
      </div>
    </StudentRoute>
  );
}
