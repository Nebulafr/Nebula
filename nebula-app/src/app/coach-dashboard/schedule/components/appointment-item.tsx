"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export interface Appointment {
  id?: string;
  time: string;
  student: string;
  avatar: string;
  type?: string;
  status?: 'confirmed' | 'pending' | 'cancelled';
}

interface AppointmentItemProps {
  appointment: Appointment;
  onViewDetails?: (appointment: Appointment) => void;
  onReschedule?: (appointment: Appointment) => void;
  onCancel?: (appointment: Appointment) => void;
}

export function AppointmentItem({
  appointment,
  onViewDetails,
  onReschedule,
  onCancel,
}: AppointmentItemProps) {
  return (
    <li className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={appointment.avatar} />
          <AvatarFallback>{appointment.student.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{appointment.student}</p>
          <p className="text-sm text-muted-foreground">{appointment.time}</p>
          {appointment.type && (
            <p className="text-xs text-muted-foreground">{appointment.type}</p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onViewDetails?.(appointment)}
        >
          Details
        </Button>
      </div>
    </li>
  );
}