"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentItem, Appointment } from "./appointment-item";

interface AppointmentsListProps {
  appointments: Appointment[];
  selectedDate: Date | undefined;
  onViewDetails?: (appointment: Appointment) => void;
  onReschedule?: (appointment: Appointment) => void;
  onCancel?: (appointment: Appointment) => void;
  loading?: boolean;
}

export function AppointmentsList({
  appointments,
  selectedDate,
  onViewDetails,
  onReschedule,
  onCancel,
  loading = false,
}: AppointmentsListProps) {
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Select a date';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointments</CardTitle>
        {selectedDate && (
          <p className="text-sm text-muted-foreground">
            {formatDate(selectedDate)}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {appointments.length > 0 ? (
          <ul className="space-y-4">
            {appointments.map((appointment, i) => (
              <AppointmentItem
                key={appointment.id || i}
                appointment={appointment}
                onViewDetails={onViewDetails}
                onReschedule={onReschedule}
                onCancel={onCancel}
              />
            ))}
          </ul>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No appointments for this day.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Select a different date to view appointments.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}