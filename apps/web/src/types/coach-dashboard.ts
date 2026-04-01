import { ApiResponse } from "./api";

export type SessionFilter = "today" | "upcoming" | "past" | "all";

export interface DashboardStudentInfo {
  id: string;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
}



export interface CoachDashboardStats {
  totalRevenue: number;
  revenueChange: number;
  activeStudents: number;
  studentsChange: number;
  sessionsThisMonth: number;
  sessionsChange: number;
  averageRating: number;
  totalReviews: number;
  totalSessions: number;
  studentsCoached: number;
}

export interface DayAvailability {
  enabled: boolean;
  intervals: Array<{
    startTime: string;
    endTime: string;
  }>;
}

export interface CoachAvailability {
  monday: DayAvailability;
  tuesday: DayAvailability;
  wednesday: DayAvailability;
  thursday: DayAvailability;
  friday: DayAvailability;
  saturday: DayAvailability;
  sunday: DayAvailability;
}

export interface CoachAvailabilityResponse extends ApiResponse<{
  availability: CoachAvailability;
}> {}

export interface FormattedStudent {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  program: string;
  status: string;
  totalSessions: number;
  attendedSessions: number;
  attendanceRate: number;
  lastSession: string | null;
  joinedDate: string;
}

export interface CoachDashboardStatsResponse extends ApiResponse<CoachDashboardStats> {}

export interface CoachStudentsResponse extends ApiResponse<{
  students: FormattedStudent[];
  pagination?: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}> {}

export interface Payout {
  id: string;
  month: string;
  amount: number;
  status: string;
  method: string | null;
  date: string;
}

export interface CoachPayoutsResponse extends ApiResponse<{
  payouts: Payout[];
  payoutsThisMonth: number;
}> {}

