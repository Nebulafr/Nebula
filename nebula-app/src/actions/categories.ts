import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/utils";

export async function getCategories() {
  return apiGet("/categories", { requireAuth: false });
}

export async function getAdminCategories() {
  return apiGet("/admin/categories");
}

export async function createCategory(categoryData: any) {
  return apiPost("/admin/categories", categoryData);
}

export async function updateCategory(categoryId: string, updateData: any) {
  return apiPut(`/admin/categories/${categoryId}`, updateData);
}

export async function deleteCategory(categoryId: string) {
  return apiDelete(`/admin/categories/${categoryId}`);
}
