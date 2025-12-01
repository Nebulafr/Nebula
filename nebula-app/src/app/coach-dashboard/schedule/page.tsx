
"use client";

import { useState } from "react";
import { ScheduleCalendar } from "./components/schedule-calendar";
import { AppointmentsList } from "./components/appointments-list";
import { ScheduleStats } from "./components/schedule-stats";
import { Appointment } from "./components/appointment-item";

const mockAppointments: Record<string, Appointment[]> = {
  "2024-08-20": [
    {
      id: "1",
      time: "09:00 AM",
      student: "Alex Thompson",
      avatar: "https://i.pravatar.cc/40?u=alex",
      type: "Career Coaching",
      status: "confirmed",
    },
    {
      id: "2", 
      time: "11:00 AM",
      student: "Sarah K.",
      avatar: "https://i.pravatar.cc/40?u=sarah",
      type: "Interview Prep",
      status: "confirmed",
    },
  ],
  "2024-08-22": [
    {
      id: "3",
      time: "02:00 PM", 
      student: "Michael T.",
      avatar: "https://i.pravatar.cc/40?u=michael",
      type: "Resume Review",
      status: "pending",
    },
  ],
};

const mockStats = {
  totalAppointments: 45,
  todayAppointments: 3,
  upcomingAppointments: 12,
  completedToday: 2,
};

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date("2024-08-20")
  );

  const selectedDateString = selectedDate
    ? selectedDate.toISOString().split("T")[0]
    : "";
  const selectedAppointments =
    mockAppointments[selectedDateString] || [];

  const handleViewDetails = (appointment: Appointment) => {
    console.log("View details for:", appointment);
  };

  const handleReschedule = (appointment: Appointment) => {
    console.log("Reschedule:", appointment);
  };

  const handleCancel = (appointment: Appointment) => {
    console.log("Cancel:", appointment);
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Schedule</h2>
        <p className="text-muted-foreground">
          Manage your coaching appointments and schedule
        </p>
      </div>

      <ScheduleStats stats={mockStats} />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <ScheduleCalendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            bookedDates={Object.keys(mockAppointments)}
          />
        </div>
        <div className="md:col-span-1">
          <AppointmentsList
            appointments={selectedAppointments}
            selectedDate={selectedDate}
            onViewDetails={handleViewDetails}
            onReschedule={handleReschedule}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}
