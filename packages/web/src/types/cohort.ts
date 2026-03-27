import { ApiResponse } from "./index";

export interface Cohort {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    maxStudents: number;
    status?: string;
    _count?: {
        enrollments: number;
    };
}

export type CohortsResponse = ApiResponse<{
    cohorts: Cohort[];
}>;
