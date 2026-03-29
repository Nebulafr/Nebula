"use client";

import { StudentRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { DashboardHeader } from "./components/dashboard-header";
import { RecommendedPrograms } from "./components/recommended-programs";
import { UpcomingSessions } from "./components/upcoming-events";
import { SuggestedCoaches } from "./components/suggested-coaches";
import {
  usePublicEvents,
  useRecommendedPrograms,
  useSuggestedCoaches,
} from "@/hooks";
import { Event } from "@/types/event";
import { ContactCard } from "./components/contact-card";

export default function DashboardPage() {
  const { profile } = useAuth();

  // Fetch data using React Query hooks
  const { data: eventsResponse, isLoading: isEventsLoading } = usePublicEvents({
    limit: 6,
  });
  const { data: programsResponse, isLoading: isProgramsLoading } =
    useRecommendedPrograms();

  console.log({ programsResponse });
  const { data: coachesResponse, isLoading: isCoachesLoading } =
    useSuggestedCoaches(4);

  const upcomingEvents =
    eventsResponse?.events?.filter((event: Event) => {
      const eventDate = new Date(event.date);
      const now = new Date();
      return eventDate > now && event.status === "UPCOMING";
    }) || [];

  const programs = programsResponse?.programs || [];
  const coaches = coachesResponse?.coaches || [];

  return (
    <StudentRoute>
      <div className="min-h-full p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <DashboardHeader user={profile} />
          <div className="space-y-12 md:space-y-16">
            <SuggestedCoaches
              coaches={coaches as any}
              user={profile!}
              loading={isCoachesLoading}
            />
            <RecommendedPrograms
              programs={programs as any}
              loading={isProgramsLoading}
            />
            <ContactCard />
            <UpcomingSessions
              sessions={upcomingEvents}
              loading={isEventsLoading}
            />
          </div>
        </div>
      </div>
    </StudentRoute>
  );
}
