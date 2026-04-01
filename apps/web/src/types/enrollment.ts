import { ApiResponse } from "./api";
import { ProgramWithRelations } from "./program";

export interface Enrollment {
  id: string;
  programId: string;
  studentId: string;
  status: string;
  progress: number;
  enrollmentDate: string;
  completionDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EnrollmentWithRelations extends Enrollment {
  program: ProgramWithRelations;
  coach: {
    id: string;
    fullName?: string | null;
    avatarUrl?: string | null;
    user?: {
      id: string;
      fullName?: string | null;
      avatarUrl?: string | null;
    };
  };
}

export type EnrollmentsResponse = ApiResponse<{
  enrollments: EnrollmentWithRelations[];
}>;
