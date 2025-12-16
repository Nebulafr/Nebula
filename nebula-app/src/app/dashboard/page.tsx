"use client";

import { StudentRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { DashboardHeader } from "./components/dashboard-header";
import { RecommendedPrograms } from "./components/recommended-programs";
import { UpcomingSessions } from "./components/upcoming-sessions";
import { SuggestedCoaches } from "./components/suggested-coaches";
import { useEventsContext } from "@/contexts/events-context";
import { useProgramsContext } from "@/contexts/programs-context";
import { sampleEvents } from "../../../data/event";
import { transformedCoaches } from "../../../data/coaches";
import { CoachWithRelations } from "@/types/coach";
import { transformedPrograms } from "../../../data/programs";

const recommendedPrograms = transformedPrograms.slice(0, 6);
const upcomingSessions = sampleEvents.slice(0, 6);
const suggestedCoaches = transformedCoaches.slice(0, 4) as CoachWithRelations[];

export default function DashboardPage() {
  const { profile } = useAuth();
  const { upcomingEvents } = useEventsContext();
  const { programs } = useProgramsContext();

  return (
    <StudentRoute>
      <div className="min-h-full bg-muted/30 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <DashboardHeader user={profile} />
          <div className="space-y-12 md:space-y-16">
            <RecommendedPrograms
              programs={programs.length > 3 ? programs : recommendedPrograms}
            />
            <UpcomingSessions
              sessions={
                upcomingEvents.length > 3 ? upcomingEvents : upcomingSessions
              }
            />
            <SuggestedCoaches coaches={suggestedCoaches} user={profile!} />
          </div>
        </div>
      </div>
    </StudentRoute>
  );
}
