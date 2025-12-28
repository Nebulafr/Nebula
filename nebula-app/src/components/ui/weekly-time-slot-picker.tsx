"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isSameDay,
  isToday,
  isBefore,
  startOfDay,
} from "date-fns";

export interface TimeSlot {
  date: Date;
  time: string;
  available: boolean;
}

export interface WeeklyTimeSlotPickerProps {
  selectedSlot?: { date: Date; time: string } | null;
  onSlotSelect: (date: Date, time: string) => void;
  availableSlots?: TimeSlot[];
  startHour?: number;
  endHour?: number;
  slotIntervalMinutes?: number;
  className?: string;
}

export function WeeklyTimeSlotPicker({
  selectedSlot,
  onSlotSelect,
  availableSlots,
  startHour = 0,
  endHour = 6,
  slotIntervalMinutes = 30,
  className,
}: WeeklyTimeSlotPickerProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotIntervalMinutes) {
        const time = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        slots.push(time);
      }
    }
    return slots;
  }, [startHour, endHour, slotIntervalMinutes]);

  const goToPreviousWeek = () => {
    setCurrentWeekStart((prev) => subWeeks(prev, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart((prev) => addWeeks(prev, 1));
  };

  const goToToday = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  const isSlotAvailable = (date: Date, time: string): boolean => {
    // If no availableSlots provided, check if date/time is in the past
    const [hours, minutes] = time.split(":").map(Number);
    const slotDateTime = new Date(date);
    slotDateTime.setHours(hours, minutes, 0, 0);

    if (isBefore(slotDateTime, new Date())) {
      return false;
    }

    if (!availableSlots) {
      return true; // All future slots available if not specified
    }

    return availableSlots.some(
      (slot) =>
        isSameDay(slot.date, date) && slot.time === time && slot.available
    );
  };

  const isSlotSelected = (date: Date, time: string): boolean => {
    if (!selectedSlot) return false;
    return isSameDay(selectedSlot.date, date) && selectedSlot.time === time;
  };

  const formatWeekRange = () => {
    const weekEnd = addDays(currentWeekStart, 6);
    const startMonth = format(currentWeekStart, "MMM");
    const endMonth = format(weekEnd, "MMM");
    const startDay = format(currentWeekStart, "d");
    const endDay = format(weekEnd, "d");
    const year = format(currentWeekStart, "yyyy");

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay}–${endDay}, ${year}`;
    }
    return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">{formatWeekRange()}</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Week grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[400px]">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className={cn(
                  "text-center py-2 text-sm font-medium",
                  isToday(day) && "text-primary"
                )}
              >
                <div>{format(day, "EEE")}</div>
                <div
                  className={cn(
                    "text-xs",
                    isToday(day) ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {format(day, "d")}
                </div>
              </div>
            ))}
          </div>

          {/* Time slots grid */}
          <div className="max-h-[400px] overflow-y-auto border rounded-lg">
            {timeSlots.map((time) => (
              <div key={time} className="grid grid-cols-7 gap-1 px-1">
                {weekDays.map((day) => {
                  const available = isSlotAvailable(day, time);
                  const selected = isSlotSelected(day, time);
                  const isPast =
                    isBefore(startOfDay(day), startOfDay(new Date())) ||
                    (isSameDay(day, new Date()) &&
                      (() => {
                        const [h, m] = time.split(":").map(Number);
                        const slotTime = new Date();
                        slotTime.setHours(h, m, 0, 0);
                        return isBefore(slotTime, new Date());
                      })());

                  return (
                    <button
                      key={`${day.toISOString()}-${time}`}
                      type="button"
                      disabled={!available || isPast}
                      onClick={() =>
                        available && !isPast && onSlotSelect(day, time)
                      }
                      className={cn(
                        "py-2 px-1 text-xs rounded transition-colors my-0.5",
                        "hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/20",
                        selected &&
                          "bg-primary text-primary-foreground hover:bg-primary/90",
                        !available && "opacity-0 cursor-default",
                        isPast && available && "opacity-30 cursor-not-allowed",
                        available && !selected && !isPast && "hover:bg-accent"
                      )}
                    >
                      {available && time}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
