import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createProgram,
  getPrograms,
  getRecommendedPrograms,
  getPopularPrograms,
  getProgramBySlug,
  updateProgram,
  deleteProgram,
  getAdminPrograms,
  updateProgramStatus,
} from "@/actions/programs";
import { CreateProgramData } from "@/lib/validations";
import { toast } from "react-toastify";

export const PROGRAMS_QUERY_KEY = "programs";
export const RECOMMENDED_PROGRAMS_QUERY_KEY = "recommended-programs";
export const POPULAR_PROGRAMS_QUERY_KEY = "popular-programs";
export const PROGRAM_BY_SLUG_QUERY_KEY = "program-by-slug";
export const ADMIN_PROGRAMS_QUERY_KEY = "admin-programs";

export function usePrograms(params?: {
  coachId?: string;
  category?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: [PROGRAMS_QUERY_KEY, params],
    queryFn: () => getPrograms(params),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

export function useRecommendedPrograms() {
  return useQuery({
    queryKey: [RECOMMENDED_PROGRAMS_QUERY_KEY],
    queryFn: getRecommendedPrograms,
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
}) {
  return useQuery({
    queryKey: [ADMIN_PROGRAMS_QUERY_KEY, filters],
    queryFn: () => getAdminPrograms(filters),
    staleTime: 1 * 60 * 1000, // 1 minute for admin data
  });
}

export function useCreateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (programData: CreateProgramData) => createProgram(programData),
    onSuccess: () => {
      // Invalidate programs queries
      queryClient.invalidateQueries({ queryKey: [PROGRAMS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [RECOMMENDED_PROGRAMS_QUERY_KEY],
      });
      queryClient.invalidateQueries({ queryKey: [ADMIN_PROGRAMS_QUERY_KEY] });
      toast.success("Program created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create program.");
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
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [PROGRAMS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [RECOMMENDED_PROGRAMS_QUERY_KEY],
      });
      queryClient.invalidateQueries({ queryKey: [ADMIN_PROGRAMS_QUERY_KEY] });
      // Invalidate specific program
      queryClient.invalidateQueries({ queryKey: [PROGRAM_BY_SLUG_QUERY_KEY] });
      toast.success("Program updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update program.");
    },
  });
}

export function useDeleteProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (programId: string) => deleteProgram(programId),
    onSuccess: () => {
      // Invalidate all programs queries
      queryClient.invalidateQueries({ queryKey: [PROGRAMS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [RECOMMENDED_PROGRAMS_QUERY_KEY],
      });
      queryClient.invalidateQueries({ queryKey: [ADMIN_PROGRAMS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [PROGRAM_BY_SLUG_QUERY_KEY] });
      toast.success("Program deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete program.");
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
    }: {
      programId: string;
      action: "activate" | "deactivate";
      reason?: string;
    }) => updateProgramStatus(programId, action, reason),
    onSuccess: (_, variables) => {
      // Invalidate admin programs specifically
      queryClient.invalidateQueries({ queryKey: [ADMIN_PROGRAMS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [PROGRAMS_QUERY_KEY] });
      toast.success(
        `Program ${
          variables.action === "activate" ? "activated" : "deactivated"
        } successfully!`
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update program status.");
    },
  });
}
