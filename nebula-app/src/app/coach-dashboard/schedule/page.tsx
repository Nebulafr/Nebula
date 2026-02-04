"use client";

import { useState, useMemo } from "react";
import { ScheduleCalendar } from "./components/schedule-calendar";
import { SessionsList } from "./components/appointments-list";
import { ScheduleStats } from "./components/schedule-stats";
import { AvailabilitySettings } from "@/components/availability-settings";
import { Session } from "./components/appointment-item";
import { toast } from "react-toastify";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { CancelSessionDialog } from "./components/cancel-session-dialog";
import { RescheduleSessionDialog } from "./components/reschedule-session-dialog";
import { 
  useCoachSessions, 
  useCoachStats, 
  useCancelCoachSession, 
  useRescheduleCoachSession 
} from "@/hooks/use-schedule-queries";


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

  const { mutateAsync: cancelSession, isPending: isCancelling } = useCancelCoachSession();
  const { mutateAsync: rescheduleSession, isPending: isRescheduling } = useRescheduleCoachSession();

  const [sessionToCancel, setSessionToCancel] = useState<Session | null>(null);
  const [sessionToReschedule, setSessionToReschedule] = useState<Session | null>(null);

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
    setSessionToReschedule(session);
  };

  const handleCancel = (session: Session) => {
    setSessionToCancel(session);
  };

  const onConfirmCancel = async (reason: string) => {
    if (!sessionToCancel) return;
    try {
      await cancelSession({ sessionId: sessionToCancel.id, reason });
      toast.success(t("list.cancelSuccess") || "Session cancelled successfully");
      setSessionToCancel(null);
    } catch (error) {
      // Error handled by hook
    }
  };

  const onConfirmReschedule = async (date: Date, startTime: string) => {
    if (!sessionToReschedule) return;
    try {
      await rescheduleSession({
        sessionId: sessionToReschedule.id,
        data: {
          date: date.toISOString().split("T")[0],
          startTime,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });
      toast.success(t("list.rescheduleSuccess") || "Session rescheduled successfully");
      setSessionToReschedule(null);
    } catch (error) {
      // Error handled by hook
    }
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
            {t("tabs.availabilityTab")}
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

      <CancelSessionDialog
        session={sessionToCancel}
        isOpen={!!sessionToCancel}
        onClose={() => setSessionToCancel(null)}
        onConfirm={onConfirmCancel}
        isLoading={isCancelling}
      />

      <RescheduleSessionDialog
        session={sessionToReschedule}
        isOpen={!!sessionToReschedule}
        onClose={() => setSessionToReschedule(null)}
        onConfirm={onConfirmReschedule}
        isLoading={isRescheduling}
      />
    </div>

  );
}
