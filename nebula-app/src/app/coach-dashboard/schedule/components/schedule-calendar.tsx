"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { cn, getStartOfWeek } from "@/lib/utils";

export interface ScheduleSession {
  id: string;
  title: string;
  scheduledTime: string;
  duration: number;
  status: string;
  students: Array<{
    id: string;
    fullName: string;
    avatarUrl?: string;
  }>;
}

interface ScheduleCalendarProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  sessions: ScheduleSession[];
  loading?: boolean;
}

export function ScheduleCalendar({
  selectedDate,
  onDateSelect,
  sessions,
  loading = false,
}: ScheduleCalendarProps) {
  const currentWeekStart = useMemo(() => {
    return getStartOfWeek(selectedDate || new Date());
  }, [selectedDate]);

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(currentWeekStart.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentWeekStart]);

  const sessionsByDate = useMemo(() => {
    const map: Record<string, ScheduleSession[]> = {};
    sessions.forEach((session) => {
      const dateKey = new Date(session.scheduledTime).toDateString();
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(session);
    });
    return map;
  }, [sessions]);

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    onDateSelect(newDate);
  };

  const goToToday = () => {
    onDateSelect(new Date());
  };

  const formatWeekRange = () => {
    const endOfWeek = new Date(currentWeekStart);
    endOfWeek.setDate(currentWeekStart.getDate() + 6);
    const startMonth = currentWeekStart.toLocaleDateString("en-US", {
      month: "short",
    });
    const endMonth = endOfWeek.toLocaleDateString("en-US", { month: "short" });
    const startDay = currentWeekStart.getDate();
    const endDay = endOfWeek.getDate();
    const year = endOfWeek.getFullYear();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay}–${endDay}, ${year}`;
    }
    return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-8 bg-muted rounded animate-pulse" />
                <div className="h-20 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Schedule
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateWeek("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[160px] text-center">
              {formatWeekRange()}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateWeek("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const isToday = day.toDateString() === today.toDateString();
            const isSelected =
              selectedDate &&
              day.toDateString() === selectedDate.toDateString();
            const daySessions = sessionsByDate[day.toDateString()] || [];

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "rounded-lg p-2 cursor-pointer transition-colors min-h-[120px]",
                  isToday && "bg-green-50 ring-1 ring-green-500",
                  isSelected && "bg-green-100",
                  !isToday && !isSelected && "hover:bg-accent/50"
                )}
                onClick={() => onDateSelect(day)}
              >
                <div className="text-center mb-2">
                  <div className="text-xs text-muted-foreground">
                    {day.toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                  <div
                    className={cn(
                      "text-lg font-semibold",
                      isToday && "text-primary"
                    )}
                  >
                    {day.getDate()}
                  </div>
                </div>
                <div className="space-y-1">
                  {daySessions.slice(0, 3).map((session) => (
                    <div
                      key={session.id}
                      className={cn(
                        "text-xs p-1 rounded truncate",
                        session.status === "SCHEDULED" &&
                          "bg-blue-100 text-blue-700",
                        session.status === "IN_PROGRESS" &&
                          "bg-green-100 text-green-700",
                        session.status === "COMPLETED" &&
                          "bg-gray-100 text-gray-700",
                        session.status === "CANCELLED" &&
                          "bg-red-100 text-red-700"
                      )}
                    >
                      {new Date(session.scheduledTime).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "numeric",
                          minute: "2-digit",
                        }
                      )}
                    </div>
                  ))}
                  {daySessions.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{daySessions.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
