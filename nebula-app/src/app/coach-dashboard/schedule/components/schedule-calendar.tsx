"use client";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";

interface ScheduleCalendarProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  bookedDates: string[];
}

export function ScheduleCalendar({
  selectedDate,
  onDateSelect,
  bookedDates,
}: ScheduleCalendarProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            modifiers={{ 
              booked: bookedDates.map(d => new Date(d)) 
            }}
            modifiersStyles={{ 
              booked: { border: '2px solid hsl(var(--primary))' } 
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}