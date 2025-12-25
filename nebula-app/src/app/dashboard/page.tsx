"use client";

import { StudentRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { DashboardHeader } from "./components/dashboard-header";
import { RecommendedPrograms } from "./components/recommended-programs";
import { UpcomingSessions } from "./components/upcoming-sessions";
import { SuggestedCoaches } from "./components/suggested-coaches";
import { usePublicEvents, useRecommendedPrograms, useCoaches } from "@/hooks";
import { Event } from "@/types/event";

export default function DashboardPage() {
  const { profile } = useAuth();
  
  // Fetch data using React Query hooks
  const { data: eventsResponse } = usePublicEvents({ limit: 6 });
  const { data: programsResponse } = useRecommendedPrograms();
  const { data: coachesResponse } = useCoaches({ limit: 4 });

  const upcomingEvents = eventsResponse?.data?.events?.filter((event: Event) => {
    const eventDate = new Date(event.date);
    const now = new Date();
    return eventDate > now && event.status === "UPCOMING";
  }) || [];

  const programs = programsResponse?.data?.programs || [];
  const coaches = coachesResponse?.data?.coaches || [];

  return (
    <StudentRoute>
      <div className="min-h-full bg-muted/30 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <DashboardHeader user={profile} />
          <div className="space-y-12 md:space-y-16">
            <RecommendedPrograms programs={programs} />
            <UpcomingSessions sessions={upcomingEvents} />
            <SuggestedCoaches coaches={coaches} user={profile!} />
          </div>
        </div>
      </div>
    </StudentRoute>
  );
}
