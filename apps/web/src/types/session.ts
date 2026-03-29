import { ApiResponse } from "./api";
import { User } from "./user";
import { SessionStatus } from "@/enums";

export interface Session {
  id: string;
  title?: string | null;
  description?: string | null;
  coachId: string;
  scheduledTime: string | Date;
  duration: number;
  status: SessionStatus;
  meetLink?: string | null;
  googleEventId?: string | null;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  coach?: {
    id: string;
    fullName?: string | null;
    email?: string;
    avatarUrl?: string | null;
  } | null;
  attendance?: Array<{
    id: string;
    attended: boolean;
    joinTime?: string | null;
    leaveTime?: string | null;
    participationScore?: number | null;
    student?: {
      id: string;
      fullName?: string | null;
      email?: string;
      avatarUrl?: string | null;
    } | null;
  }>;
}

export interface CoachDashboardSessionStudent {
  id: string;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
}

export interface CoachDashboardSession {
  id: string;
  title: string | null;
  description: string | null;
  scheduledTime: string | Date;
  duration: number;
  status: string;
  meetLink: string | null;
  students: CoachDashboardSessionStudent[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface StudentSession extends Session { }

export interface StudentSessionsResponse extends ApiResponse<{
  sessions: StudentSession[];
}> { }

export interface CoachSessionsResponse extends ApiResponse<{
  sessions: CoachDashboardSession[];
}> { }
