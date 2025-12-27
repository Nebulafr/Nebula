"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Video, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SessionStudent {
  id: string;
  fullName: string;
  email?: string;
  avatarUrl?: string;
  attended?: boolean;
}

export interface Session {
  id: string;
  title: string;
  description?: string;
  scheduledTime: string;
  duration: number;
  status: string;
  meetLink?: string;
  notes?: string;
  students: SessionStudent[];
}

interface SessionItemProps {
  session: Session;
  onViewDetails?: (session: Session) => void;
  onStartSession?: (session: Session) => void;
  onReschedule?: (session: Session) => void;
  onCancel?: (session: Session) => void;
}

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-green-100 text-green-700 border-green-200",
  COMPLETED: "bg-gray-100 text-gray-700 border-gray-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
};

export function SessionItem({
  session,
  onViewDetails,
  onStartSession,
  onReschedule,
  onCancel,
}: SessionItemProps) {
  const scheduledDate = new Date(session.scheduledTime);
  const timeString = scheduledDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const isUpcoming =
    session.status === "SCHEDULED" && scheduledDate > new Date();
  const canStart =
    session.status === "SCHEDULED" &&
    Math.abs(scheduledDate.getTime() - Date.now()) < 15 * 60 * 1000; // 15 min before

  return (
    <li className="p-4 rounded-lg border bg-card hover:bg-accent/30 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold truncate">{session.title}</h4>
            <Badge
              variant="outline"
              className={cn("text-xs", statusColors[session.status])}
            >
              {session.status.replace("_", " ")}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeString} ({session.duration} min)
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {session.students.length} student
              {session.students.length !== 1 ? "s" : ""}
            </span>
          </div>

          {session.students.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {session.students.slice(0, 3).map((student) => (
                  <Avatar
                    key={student.id}
                    className="h-6 w-6 border-2 border-background"
                  >
                    <AvatarImage src={student.avatarUrl} />
                    <AvatarFallback className="text-xs">
                      {student.fullName?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {session.students.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{session.students.length - 3} more
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {session.students.map((s) => s.fullName).join(", ")}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {canStart && session.meetLink && (
            <Button
              size="sm"
              className="gap-1"
              onClick={() => onStartSession?.(session)}
            >
              <Video className="h-3 w-3" />
              Start
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails?.(session)}>
                View Details
              </DropdownMenuItem>
              {isUpcoming && (
                <>
                  <DropdownMenuItem onClick={() => onReschedule?.(session)}>
                    Reschedule
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onCancel?.(session)}
                  >
                    Cancel Session
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </li>
  );
}

// Legacy export for backward compatibility
export interface Appointment {
  id?: string;
  time: string;
  student: string;
  avatar: string;
  type?: string;
  status?: "confirmed" | "pending" | "cancelled";
}

export function AppointmentItem({
  appointment,
}: {
  appointment: Appointment;
  onViewDetails?: (appointment: Appointment) => void;
  onReschedule?: (appointment: Appointment) => void;
  onCancel?: (appointment: Appointment) => void;
}) {
  // Convert legacy format to new format
  const session: Session = {
    id: appointment.id || "",
    title: appointment.type || "Coaching Session",
    scheduledTime: new Date().toISOString(),
    duration: 60,
    status:
      appointment.status === "confirmed"
        ? "SCHEDULED"
        : appointment.status === "cancelled"
        ? "CANCELLED"
        : "SCHEDULED",
    students: [
      {
        id: "1",
        fullName: appointment.student,
        avatarUrl: appointment.avatar,
      },
    ],
  };

  return <SessionItem session={session} />;
}
