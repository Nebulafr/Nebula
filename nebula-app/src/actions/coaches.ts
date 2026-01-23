import { apiGet, apiPost, apiPut } from "@/lib/utils";
import { CoachUpdateData, CreateCoachData } from "@/lib/validations";

export async function getCoaches(filters?: {
  category?: string;
  search?: string;
  limit?: number;
}) {
  const params = new URLSearchParams();

  if (filters?.category && filters.category !== "All") {
    params.append("category", filters.category);
  }
  if (filters?.search) {
    params.append("search", filters.search);
  }
  if (filters?.limit) {
    params.append("limit", filters.limit.toString());
  }

  const url = `/coaches${params.toString() ? `?${params.toString()}` : ""}`;
  return apiGet(url, { requireAuth: false });
}

export async function getCoachBySlug(slug: string) {
  return apiGet(`/coaches/${slug}`, { requireAuth: false });
}

export async function getCoachById(coachId: string) {
  return apiGet(`/coaches/${coachId}`, { requireAuth: false });
}

export async function createCoach(coachData: CreateCoachData) {
  return apiPost("/coaches/profile", coachData, { throwOnError: true });
}

export async function updateCoachProfile(coachData: CoachUpdateData) {
  return apiPut("/coaches/profile", coachData, { throwOnError: true });
}

export async function getSuggestedCoaches(limit?: number) {
  const params = new URLSearchParams();

  if (limit) {
    params.append("limit", limit.toString());
  }

  const url = `/coaches/suggested${
    params.toString() ? `?${params.toString()}` : ""
  }`;
  return apiGet(url, { requireAuth: true });
}
