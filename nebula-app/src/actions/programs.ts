import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/utils";
import { CreateProgramData } from "@/lib/validations";

export async function createProgram(programData: CreateProgramData) {
  return apiPost("/programs", programData, { throwOnError: true });
}

export async function getPrograms(params?: {
  coachId?: string;
  category?: string;
  search?: string;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params?.coachId) searchParams.set("coachId", params.coachId);
  if (params?.category) searchParams.set("category", params.category);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.limit) searchParams.set("limit", params.limit.toString());

  const query = searchParams.toString() ? `?${searchParams}` : "";
  return apiGet(`/programs${query}`, { requireAuth: false });
}

export async function getGroupedPrograms(params?: {
  category?: string;
  search?: string;
  limit?: number;
  page?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params?.category) searchParams.set("category", params.category);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.page) searchParams.set("page", params.page.toString());

  const query = searchParams.toString() ? `?${searchParams}` : "";
  return apiGet(`/programs/grouped${query}`, { requireAuth: false });
}

export async function getRecommendedPrograms() {
  return apiGet("/programs/recommended", { requireAuth: true });
}

export async function getPopularPrograms(params?: { limit?: number }) {
  const searchParams = new URLSearchParams();

  if (params?.limit) searchParams.set("limit", params.limit.toString());

  const query = searchParams.toString() ? `?${searchParams}` : "";
  return apiGet(`/programs/popular${query}`, { requireAuth: false });
}

export async function getProgramBySlug(slug: string) {
  return apiGet(`/programs/slug/${slug}`, { requireAuth: false });
}

export async function getProgramById(programId: string) {
  return apiGet(`/programs/id/${programId}`);
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
}) {
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

  const url = `/admin/programs${
    params.toString() ? `?${params.toString()}` : ""
  }`;
  return apiGet(url);
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
