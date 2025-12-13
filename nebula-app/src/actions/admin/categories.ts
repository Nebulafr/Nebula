import { makeRequest } from "@/lib/utils";
import { CreateCategoryData, UpdateCategoryData } from "@/lib/validations";
import { CategoriesResponse, CategoryActionResponse } from "@/types/category";

export async function getAdminCategories(): Promise<CategoriesResponse> {
  try {
    const response = await makeRequest("/admin/categories", "GET", {
      requireAuth: true,
    });

    return {
      success: true,
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
    const response = await makeRequest("/admin/categories", "POST", {
      body: categoryData,
      requireAuth: true,
    });

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
    const response = await makeRequest(
      `/admin/categories/${categoryId}`,
      "PUT",
      {
        body: updateData,
        requireAuth: true,
      }
    );

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
    const response = await makeRequest(
      `/admin/categories/${categoryId}`,
      "DELETE",
      {
        requireAuth: true,
      }
    );

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
