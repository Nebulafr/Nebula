"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Session, SessionItem } from "./appointment-item";
import { Plus, CalendarDays } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface SessionsListProps {
  sessions: Session[];
  selectedDate?: Date;
  onViewDetails?: (session: Session) => void;
  onStartSession?: (session: Session) => void;
  onReschedule?: (session: Session) => void;
  onCancel?: (session: Session) => void;
  onCreateSession?: () => void;
  loading?: boolean;
}

export function SessionsList({
  sessions,
  selectedDate,
  onViewDetails,
  onStartSession,
  onReschedule,
  onCancel,
  onCreateSession,
  loading = false,
}: SessionsListProps) {
  const t = useTranslations("dashboard.coach.schedule.sessionsList");
  const locale = useLocale();

  const formatDate = (date: Date | undefined) => {
    if (!date) return t("selectDateShort");
    return date.toLocaleDateString(locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-lg border">
                <div className="h-5 w-32 bg-muted rounded animate-pulse mb-2" />
                <div className="h-4 w-24 bg-muted rounded animate-pulse mb-2" />
                <div className="flex gap-2">
                  <div className="h-6 w-6 bg-muted rounded-full animate-pulse" />
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            {t("title")}
          </CardTitle>
          {selectedDate && (
            <p className="text-sm text-muted-foreground mt-1">
              {formatDate(selectedDate)}
            </p>
          )}
        </div>
        {onCreateSession && (
          <Button size="sm" onClick={onCreateSession} className="gap-1 bg-green-500 hover:bg-green-600 text-white">
            <Plus className="h-4 w-4" />
            {t("newSession")}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {sessions.length > 0 ? (
          <ul className="space-y-3">
            {sessions.map((session) => (
              <SessionItem
                key={session.id}
                session={session}
                onViewDetails={onViewDetails}
                onStartSession={onStartSession}
                onReschedule={onReschedule}
                onCancel={onCancel}
              />
            ))}
          </ul>
        ) : (
          <div className="text-center py-8">
            <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">{t("noSessions")}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedDate
                ? t("selectDifferent")
                : t("selectDate")}
            </p>
            {onCreateSession && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCreateSession}
                className="mt-4 gap-1 border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
              >
                <Plus className="h-4 w-4" />
                {t("createSession")}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Legacy export for backward compatibility
export { SessionsList as AppointmentsList };
