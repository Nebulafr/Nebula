import { apiGet } from "@/lib/utils";

export interface PublicCategory {
  name: string;
  slug: string;
}

export interface CategoriesResponse {
  success: boolean;
  data?: {
    categories: PublicCategory[];
  };
  error?: string;
  message?: string;
}

export async function getCategories(): Promise<CategoriesResponse> {
  try {
    const response = await apiGet("/categories", { requireAuth: false });
    return {
      success: response.success!,
      data: response.data,
      message: response.message,
    };
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch categories",
      message: error.message || "An unexpected error occurred",
    };
  }
}
