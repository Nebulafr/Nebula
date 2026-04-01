import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/utils";
import { CategoriesResponse } from "@/types";

export async function getCategories(): Promise<CategoriesResponse> {
  return apiGet<CategoriesResponse["data"]>("/categories", { requireAuth: false }) as Promise<CategoriesResponse>;
}

export async function getAdminCategories(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<CategoriesResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set("page", params.page.toString());
  if (params?.limit) queryParams.set("limit", params.limit.toString());
  if (params?.search) queryParams.set("search", params.search);

  const queryString = queryParams.toString();
  const url = `/admin/categories${queryString ? `?${queryString}` : ""}`;

  return apiGet<CategoriesResponse["data"]>(url) as Promise<CategoriesResponse>;
}

 
export async function createCategory(categoryData: any) {
  return apiPost("/admin/categories", categoryData, { throwOnError: true });
}

 
export async function updateCategory(categoryId: string, updateData: any) {
  return apiPut(`/admin/categories/${categoryId}`, updateData, { throwOnError: true });
}

export async function deleteCategory(categoryId: string) {
  return apiDelete(`/admin/categories/${categoryId}`, { throwOnError: true });
}
