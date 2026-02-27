import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createProgram,
  getPrograms,
  getGroupedPrograms,
  getRecommendedPrograms,
  getPopularPrograms,
  getProgramBySlug,
  getProgramById,
  updateProgram,
  deleteProgram,
  getAdminPrograms,
  updateProgramStatus,
  submitProgram,
} from "@/actions/programs";
import { ProgramResponse, AdminProgramsResponse } from "@/types/program";
import { ProgramsResponse } from "@/types";
import { CreateProgramData } from "@/lib/validations";
import { handleAndToastError } from "@/lib/error-handler";

export const PROGRAMS_QUERY_KEY = "programs";
export const GROUPED_PROGRAMS_QUERY_KEY = "grouped-programs";
export const RECOMMENDED_PROGRAMS_QUERY_KEY = "recommended-programs";
export const POPULAR_PROGRAMS_QUERY_KEY = "popular-programs";
export const PROGRAM_BY_SLUG_QUERY_KEY = "program-by-slug";
export const PROGRAM_BY_ID_QUERY_KEY = "program-by-id";
export const ADMIN_PROGRAMS_QUERY_KEY = "admin-programs";

export function useProgramById(id: string) {
  return useQuery<ProgramResponse["data"]>({
    queryKey: [PROGRAM_BY_ID_QUERY_KEY, id],
    queryFn: async () => {
      const response = await getProgramById(id);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch program");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePrograms(params?: {
  coachId?: string;
  category?: string;
  search?: string;
  limit?: number;
}) {
  return useQuery<ProgramsResponse["data"]>({
    queryKey: [PROGRAMS_QUERY_KEY, params],
    queryFn: async () => {
      const response = await getPrograms(params);
      if (response.success && response.data) return response.data;
      throw new Error(response.message || "Failed to fetch programs");
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

export function useGroupedPrograms(params?: {
  category?: string;
  search?: string;
  limit?: number;
  page?: number;
}) {
  return useQuery({
    queryKey: [GROUPED_PROGRAMS_QUERY_KEY, params],
    queryFn: () => getGroupedPrograms(params),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

export function useRecommendedPrograms() {
  return useQuery<ProgramsResponse["data"]>({
    queryKey: [RECOMMENDED_PROGRAMS_QUERY_KEY],
    queryFn: async () => {
      const response = await getRecommendedPrograms();
      if (response.success && response.data) return response.data;
      throw new Error(response.message || "Failed to fetch recommended programs");
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePopularPrograms(params?: { limit?: number }) {
  return useQuery({
    queryKey: [POPULAR_PROGRAMS_QUERY_KEY, params],
    queryFn: () => getPopularPrograms(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProgramBySlug(slug: string) {
  return useQuery({
    queryKey: [PROGRAM_BY_SLUG_QUERY_KEY, slug],
    queryFn: () => getProgramBySlug(slug),
    enabled: !!slug,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useAdminPrograms(filters?: {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery<AdminProgramsResponse["data"]>({
    queryKey: [ADMIN_PROGRAMS_QUERY_KEY, filters],
    queryFn: async () => {
      const response = await getAdminPrograms(filters);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch admin programs");
    },
    staleTime: 1 * 60 * 1000, // 1 minute for admin data
  });
}

export function useCreateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (programData: CreateProgramData) => createProgram(programData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROGRAMS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [RECOMMENDED_PROGRAMS_QUERY_KEY],
      });
      queryClient.invalidateQueries({ queryKey: [ADMIN_PROGRAMS_QUERY_KEY] });
    },
    onError: (error: unknown) => {
      handleAndToastError(error, "Failed to create program.");
    },
  });
}

export function useUpdateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      programId,
      updateData,
    }: {
      programId: string;
      updateData: Partial<CreateProgramData>;
    }) => updateProgram(programId, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROGRAMS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [RECOMMENDED_PROGRAMS_QUERY_KEY],
      });
      queryClient.invalidateQueries({ queryKey: [ADMIN_PROGRAMS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [PROGRAM_BY_SLUG_QUERY_KEY] });
    },
    onError: (error: unknown) => {
      handleAndToastError(error, "Failed to update program.");
    },
  });
}

export function useDeleteProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (programId: string) => deleteProgram(programId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROGRAMS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [RECOMMENDED_PROGRAMS_QUERY_KEY],
      });
      queryClient.invalidateQueries({ queryKey: [ADMIN_PROGRAMS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [PROGRAM_BY_SLUG_QUERY_KEY] });
    },
    onError: (error: unknown) => {
      handleAndToastError(error, "Failed to delete program.");
    },
  });
}

export function useUpdateProgramStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      programId,
      action,
      reason,
      startDate,
    }: {
      programId: string;
      action: "approve" | "reject" | "activate" | "deactivate";
      reason?: string;
      startDate?: string;
    }) => updateProgramStatus(programId, action, reason, startDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_PROGRAMS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [PROGRAMS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [PROGRAM_BY_SLUG_QUERY_KEY] });
    },
    onError: (error: unknown) => {
      handleAndToastError(error, "Failed to update program status.");
    },
  });
}

export function useSubmitProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (programId: string) => submitProgram(programId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROGRAMS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [PROGRAM_BY_SLUG_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [ADMIN_PROGRAMS_QUERY_KEY] });
    },
    onError: (error: unknown) => {
      handleAndToastError(error, "Failed to submit program.");
    },
  });
}
