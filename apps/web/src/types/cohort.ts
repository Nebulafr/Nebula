import { ApiResponse } from "./api";

export interface Cohort {
  id: string;
  name?: string | null;
  startDate: string | Date;
  endDate?: string | Date | null;
  maxStudents: number;
  status: string;
  _count?: {
    enrollments: number;
  };
}

export type CohortsResponse = ApiResponse<{
  cohorts: Cohort[];
}>;
