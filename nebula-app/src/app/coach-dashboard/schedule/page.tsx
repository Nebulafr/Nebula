"use client";

import { useState, useMemo } from "react";
import { ScheduleCalendar } from "./components/schedule-calendar";
import { SessionsList } from "./components/appointments-list";
import { ScheduleStats } from "./components/schedule-stats";
import { AvailabilitySettings } from "@/components/availability-settings";
import { Session } from "./components/appointment-item";
import { useCoachSessions, useCoachStats } from "@/hooks/use-schedule-queries";
import { toast } from "react-toastify";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Settings } from "lucide-react";

import { useTranslations } from "next-intl";

export default function SchedulePage() {
  const t = useTranslations("dashboard.coach.schedule");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  // Fetch sessions and stats
  const { data: sessionsData, isLoading: sessionsLoading } =
    useCoachSessions("all");
  const { data: statsData, isLoading: statsLoading } = useCoachStats();

  const sessions: Session[] = useMemo(() => {
    if (!sessionsData?.data?.sessions) return [];
    return sessionsData.data.sessions;
  }, [sessionsData]);

  const stats = useMemo(() => {
    return statsData?.data || {};
  }, [statsData]);

  // Filter sessions for selected date
  const selectedDateSessions = useMemo(() => {
    if (!selectedDate || !sessions.length) return [];
    return sessions.filter((session) => {
      const sessionDate = new Date(session.scheduledTime);
      return sessionDate.toDateString() === selectedDate.toDateString();
    });
  }, [sessions, selectedDate]);

  const handleViewDetails = (session: Session) => {
    console.log("View details for:", session);
  };

  const handleStartSession = (session: Session) => {
    if (session.meetLink) {
      window.open(session.meetLink, "_blank");
    } else {
      toast.error(t("noMeetingLink"));
    }
  };

  const handleReschedule = (session: Session) => {
    console.log("Reschedule:", session);
  };

  const handleCancel = (session: Session) => {
    console.log("Cancel:", session);
  };

  const handleCreateSession = () => {
    //
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
        <p className="text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <ScheduleStats stats={stats} loading={statsLoading} />

      <Tabs defaultValue="sessions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sessions" className="gap-2">
            <Calendar className="h-4 w-4" />
            {t("tabs.sessions")}
          </TabsTrigger>
          <TabsTrigger value="availability" className="gap-2">
            <Settings className="h-4 w-4" />
            {t("tabs.availability")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ScheduleCalendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                sessions={sessions}
                loading={sessionsLoading}
              />
            </div>
            <div className="lg:col-span-1">
              <SessionsList
                sessions={selectedDateSessions}
                selectedDate={selectedDate}
                onViewDetails={handleViewDetails}
                onStartSession={handleStartSession}
                onReschedule={handleReschedule}
                onCancel={handleCancel}
                onCreateSession={handleCreateSession}
                loading={sessionsLoading}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="availability">
          <div className="max-w-2xl">
            <AvailabilitySettings />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
