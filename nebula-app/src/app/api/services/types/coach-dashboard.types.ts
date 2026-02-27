 
import { Category, Module, Program, SessionStatus } from "@/generated/prisma";

export type SessionFilter = "today" | "upcoming" | "past" | "all";

export interface DashboardStudentInfo {
  id: string;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
}

export interface TransformedSession {
  id: string;
  title: string | null;
  description: string | null;
  scheduledTime: string;
  duration: number;
  status: SessionStatus;
  meetLink: string | null;
  students: DashboardStudentInfo[];
  createdAt: string;
  updatedAt: string;
}

export interface TransformedProgram {
  id: string;
  title: string;
  slug: string;
  description: string;
  objectives: string[];
  price: number;
  duration: string | null;
  difficultyLevel: string;
  maxStudents: number;
  currentEnrollments: number;
  isActive: boolean;
  status: string;
  rating: number;
  totalReviews: number;
  tags: string[];
  prerequisites: string[];
  category: Pick<Category, "name" | "slug"> | null;
  modules: Module[];
  createdAt: string;
  updatedAt: string;
}

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

export interface Payout {
  id: string;
  month: string;
  amount: number;
  method: string;
  date: string;
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
