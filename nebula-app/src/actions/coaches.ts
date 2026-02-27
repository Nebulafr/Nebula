import { apiGet, apiPost, apiPut } from "@/lib/utils";
import { CoachUpdateData, CreateCoachData } from "@/lib/validations";
import { CoachesResponse, CoachDetailResponse } from "@/types/coach";

export async function getCoaches(filters?: {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  company?: string;
  school?: string;
  limit?: number;
  page?: number;
}): Promise<CoachesResponse> {
  const params = new URLSearchParams();

  if (filters?.category && filters.category !== "All") {
    params.append("category", filters.category);
  }
  if (filters?.search) {
    params.append("search", filters.search);
  }
  if (filters?.minPrice !== undefined) {
    params.append("minPrice", filters.minPrice.toString());
  }
  if (filters?.maxPrice !== undefined) {
    params.append("maxPrice", filters.maxPrice.toString());
  }
  if (filters?.company && filters.company !== "all") {
    params.append("company", filters.company);
  }
  if (filters?.school && filters.school !== "all") {
    params.append("school", filters.school);
  }
  if (filters?.limit) {
    params.append("limit", filters.limit.toString());
  }
  if (filters?.page) {
    params.append("page", filters.page.toString());
  }

  const url = `/coaches${params.toString() ? `?${params.toString()}` : ""}`;
  return apiGet<CoachesResponse["data"]>(url, { requireAuth: false }) as Promise<CoachesResponse>;
}

export async function getCoachBySlug(slug: string): Promise<CoachDetailResponse> {
  return apiGet<CoachDetailResponse["data"]>(`/coaches/${slug}`, { requireAuth: false }) as Promise<CoachDetailResponse>;
}

export async function getCoachById(coachId: string): Promise<CoachDetailResponse> {
  return apiGet<CoachDetailResponse["data"]>(`/coaches/${coachId}`, { requireAuth: false }) as Promise<CoachDetailResponse>;
}

export async function createCoach(coachData: CreateCoachData) {
  return apiPost("/coaches/profile", coachData, { throwOnError: true });
}

export async function updateCoachProfile(coachData: CoachUpdateData) {
  return apiPut("/coaches/profile", coachData, { throwOnError: true });
}

export async function getSuggestedCoaches(limit?: number): Promise<CoachesResponse> {
  const params = new URLSearchParams();

  if (limit) {
    params.append("limit", limit.toString());
  }

  const url = `/coaches/suggested${params.toString() ? `?${params.toString()}` : ""
    }`;
  return apiGet<CoachesResponse["data"]>(url, { requireAuth: true }) as Promise<CoachesResponse>;
}
