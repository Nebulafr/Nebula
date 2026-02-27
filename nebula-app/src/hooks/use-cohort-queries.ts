import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, apiPost } from "@/lib/utils";
import { handleAndToastError } from "@/lib/error-handler";
import { Cohort, CohortsResponse } from "@/types/cohort";

export const ADMIN_COHORTS_QUERY_KEY = "admin-cohorts";

export function useCohorts(programId?: string) {
    return useQuery({
        queryKey: [ADMIN_COHORTS_QUERY_KEY, programId],
        queryFn: async () => {
            const response = await apiGet<CohortsResponse["data"]>(`/admin/cohorts?programId=${programId}`);
            return response as CohortsResponse;
        },
        enabled: !!programId,
    });
}

export function useUpdateCohort(programId?: string, options?: { onSuccess?: () => void }) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ cohortId, data }: { cohortId: string; data: Partial<Cohort> }) => {
            return apiPatch(`/admin/cohorts/${cohortId}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [ADMIN_COHORTS_QUERY_KEY, programId],
            });
            options?.onSuccess?.();
        },
        onError: (error: unknown) => {
            handleAndToastError(error, "Failed to update cohort");
        },
    });
}

export function useCreateCohort(programId?: string, options?: { onSuccess?: () => void }) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Partial<Cohort> & { programId: string }) => {
            return apiPost("/admin/cohorts", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [ADMIN_COHORTS_QUERY_KEY, programId],
            });
            options?.onSuccess?.();
        },
        onError: (error: unknown) => {
            handleAndToastError(error, "Failed to create cohort");
        },
    });
}
