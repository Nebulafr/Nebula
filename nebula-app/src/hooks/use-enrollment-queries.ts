import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch } from "@/lib/utils";
import { EnrollmentStatus } from "@/generated/prisma";

export const ENROLLMENTS_QUERY_KEY = "student-enrollments";

interface EnrollmentFilters {
  status?: EnrollmentStatus;
}

// Get student enrollments
export function useStudentEnrollments(filters?: EnrollmentFilters) {
  return useQuery({
    queryKey: [ENROLLMENTS_QUERY_KEY, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) {
        params.set("status", filters.status);
      }

      const endpoint = `/students/enrollments${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      return apiGet(endpoint);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Update enrollment progress
export function useUpdateEnrollmentProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      enrollmentId,
      progress,
    }: {
      enrollmentId: string;
      progress: number;
    }) => {
      return apiPatch(`/students/enrollments/${enrollmentId}`, { progress });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ENROLLMENTS_QUERY_KEY] });
    },
  });
}

// Helper hooks for specific enrollment statuses
export function useActiveEnrollments() {
  return useStudentEnrollments({ status: EnrollmentStatus.ACTIVE });
}

export function useCompletedEnrollments() {
  return useStudentEnrollments({ status: EnrollmentStatus.COMPLETED });
}

export function usePausedEnrollments() {
  return useStudentEnrollments({ status: EnrollmentStatus.PAUSED });
}

export function useCancelledEnrollments() {
  return useStudentEnrollments({ status: EnrollmentStatus.CANCELLED });
}
