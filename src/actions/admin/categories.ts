import { Category } from "@/generated/prisma";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/utils";

export interface CategoriesResponse {
  success: boolean;
  data?: {
    categories: Category[];
  };
  error?: string;
  message?: string;
}

export interface CategoryActionResponse {
  success: boolean;
  data?: {
    category: Category;
  };
  error?: string;
  message?: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export async function getAdminCategories(): Promise<CategoriesResponse> {
  try {
    const response = await apiGet("/admin/categories");

    return {
      success: response.success!,
      data: response.data,
      message: response.message,
    };
  } catch (error: any) {
    console.error("Error fetching admin categories:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch categories",
      message: error.message || "An unexpected error occurred",
    };
  }
}

export async function createCategory(
  categoryData: CreateCategoryData
): Promise<CategoryActionResponse> {
  try {
    const response = await apiPost("/admin/categories", categoryData);

    if (!response.success) {
      throw new Error(response.message || "Failed to create category");
    }

    return {
      success: true,
      data: response.data,
      message: response.message,
    };
  } catch (error: any) {
    console.error("Error creating category:", error);
    return {
      success: false,
      error: error.message || "Failed to create category",
      message: error.message || "An unexpected error occurred",
    };
  }
}

export async function updateCategory(
  categoryId: string,
  updateData: UpdateCategoryData
): Promise<CategoryActionResponse> {
  try {
    const response = await apiPut(
      `/admin/categories/${categoryId}`,
      updateData
    );

    if (!response.success) {
      throw new Error(response.message || "Failed to update category");
    }

    return {
      success: true,
      data: response.data,
      message: response.message,
    };
  } catch (error: any) {
    console.error("Error updating category:", error);
    return {
      success: false,
      error: error.message || "Failed to update category",
      message: error.message || "An unexpected error occurred",
    };
  }
}

export async function deleteCategory(
  categoryId: string
): Promise<CategoryActionResponse> {
  try {
    const response = await apiDelete(`/admin/categories/${categoryId}`);

    if (!response.success) {
      throw new Error(response.message || "Failed to delete category");
    }

    return {
      success: true,
      message: response.message,
    };
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return {
      success: false,
      error: error.message || "Failed to delete category",
      message: error.message || "An unexpected error occurred",
    };
  }
}
