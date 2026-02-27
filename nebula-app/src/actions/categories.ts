import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/utils";
import { CategoriesResponse } from "@/types";

export async function getCategories(): Promise<CategoriesResponse> {
  return apiGet<CategoriesResponse["data"]>("/categories", { requireAuth: false }) as Promise<CategoriesResponse>;
}

export async function getAdminCategories(): Promise<CategoriesResponse> {
  return apiGet<CategoriesResponse["data"]>("/admin/categories") as Promise<CategoriesResponse>;
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
