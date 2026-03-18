import { Category } from "@/generated/prisma";

export interface CategoriesResponse {
  success: boolean;
  data?: {
    categories: Category[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
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

export interface PublicCategory {
  name: string;
  slug: string;
}
