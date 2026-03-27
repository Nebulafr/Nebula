import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/utils";
import { CreateProgramData } from "@/lib/validations";
import { ProgramsResponse, GroupedProgramsResponse, ProgramResponse } from "@/types";
import { AdminProgramsResponse } from "@/types/program";

export async function createProgram(programData: CreateProgramData) {
  return apiPost("/programs", programData, { throwOnError: true });
}

export async function getPrograms(params?: {
  coachId?: string;
  category?: string;
  search?: string;
  limit?: number;
}): Promise<ProgramsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.coachId) searchParams.set("coachId", params.coachId);
  if (params?.category) searchParams.set("category", params.category);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.limit) searchParams.set("limit", params.limit.toString());

  const query = searchParams.toString() ? `?${searchParams}` : "";
  return apiGet<ProgramsResponse["data"]>(`/programs${query}`, { requireAuth: false }) as Promise<ProgramsResponse>;
}

export async function getGroupedPrograms(params?: {
  category?: string;
  search?: string;
  limit?: number;
  page?: number;
}): Promise<GroupedProgramsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.category) searchParams.set("category", params.category);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.page) searchParams.set("page", params.page.toString());

  const query = searchParams.toString() ? `?${searchParams}` : "";
  return apiGet<GroupedProgramsResponse["data"]>(`/programs/grouped${query}`, { requireAuth: false }) as Promise<GroupedProgramsResponse>;
}

export async function getRecommendedPrograms(): Promise<ProgramsResponse> {
  return apiGet<ProgramsResponse["data"]>("/programs/recommended", { requireAuth: true }) as Promise<ProgramsResponse>;
}

export async function getPopularPrograms(params?: { limit?: number }): Promise<ProgramsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.limit) searchParams.set("limit", params.limit.toString());

  const query = searchParams.toString() ? `?${searchParams}` : "";
  return apiGet<ProgramsResponse["data"]>(`/programs/popular${query}`, { requireAuth: false }) as Promise<ProgramsResponse>;
}

export async function getProgramBySlug(slug: string): Promise<ProgramResponse> {
  return apiGet<ProgramResponse["data"]>(`/programs/slug/${slug}`, { requireAuth: false }) as Promise<ProgramResponse>;
}

export async function getProgramById(programId: string): Promise<ProgramResponse> {
  return apiGet<ProgramResponse["data"]>(`/programs/id/${programId}`) as Promise<ProgramResponse>;
}

export async function updateProgram(
  programId: string,
  updateData: Partial<CreateProgramData>,
) {
  return apiPut(`/programs/id/${programId}`, updateData, {
    throwOnError: true,
  });
}

export async function deleteProgram(programId: string) {
  return apiDelete(`/programs/id/${programId}`, { throwOnError: true });
}

export async function getAdminPrograms(filters?: {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<AdminProgramsResponse> {
  const params = new URLSearchParams();

  if (filters?.status && filters.status !== "all") {
    params.set("status", filters.status);
  }
  if (filters?.category && filters.category !== "all") {
    params.set("category", filters.category);
  }
  if (filters?.search) {
    params.set("search", filters.search);
  }
  if (filters?.page) {
    params.set("page", filters.page.toString());
  }
  if (filters?.limit) {
    params.set("limit", filters.limit.toString());
  }

  const url = `/admin/programs${params.toString() ? `?${params.toString()}` : ""
    }`;
  return apiGet<AdminProgramsResponse["data"]>(url) as Promise<AdminProgramsResponse>;
}

export async function updateProgramStatus(
  programId: string,
  action: "approve" | "reject" | "activate" | "deactivate",
  reason?: string,
  startDate?: string,
) {
  return apiPost(
    `/admin/programs/${programId}/actions`,
    { action, reason, startDate },
    { throwOnError: true },
  );
}

export async function submitProgram(programId: string) {
  return apiPost(`/programs/id/${programId}/submit`, {}, { throwOnError: true });
}
