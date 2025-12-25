import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/utils";
import { CreateProgramData } from "@/lib/validations";

export async function createProgram(programData: CreateProgramData) {
  return apiPost("/programs", programData);
}

export async function getPrograms(params?: {
  coachId?: string;
  category?: string;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params?.coachId) searchParams.set("coachId", params.coachId);
  if (params?.category) searchParams.set("category", params.category);
  if (params?.limit) searchParams.set("limit", params.limit.toString());

  const query = searchParams.toString() ? `?${searchParams}` : "";
  return apiGet(`/programs${query}`, { requireAuth: false });
}

export async function getRecommendedPrograms() {
  return apiGet("/programs/recommended", { requireAuth: false });
}

export async function getPopularPrograms(params?: { limit?: number }) {
  const searchParams = new URLSearchParams();
  
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  
  const query = searchParams.toString() ? `?${searchParams}` : "";
  return apiGet(`/programs/popular${query}`, { requireAuth: false });
}

export async function getProgramBySlug(slug: string) {
  return apiGet(`/programs/${slug}`);
}

export async function updateProgram(
  programId: string,
  updateData: Partial<CreateProgramData>
) {
  return apiPut(`/programs/${programId}`, updateData);
}

export async function deleteProgram(programId: string) {
  return apiDelete(`/programs/${programId}`);
}

export async function getAdminPrograms(filters?: {
  status?: string;
  category?: string;
  search?: string;
}) {
  const params = new URLSearchParams();

  if (filters?.status && filters.status !== "all") {
    params.append("status", filters.status);
  }
  if (filters?.category && filters.category !== "all") {
    params.append("category", filters.category);
  }
  if (filters?.search) {
    params.append("search", filters.search);
  }

  const url = `/admin/programs${
    params.toString() ? `?${params.toString()}` : ""
  }`;
  return apiGet(url);
}

export async function updateProgramStatus(
  programId: string,
  action: "activate" | "deactivate",
  reason?: string
) {
  return apiPost(`/admin/programs/${programId}/actions`, { action, reason });
}
