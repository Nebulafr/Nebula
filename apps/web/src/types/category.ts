import { ApiResponse } from "./api";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  assetUrl?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoriesResponse extends ApiResponse<{
  categories: Category[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> {}

export interface CategoryActionResponse extends ApiResponse<{
  category: Category;
}> {}



export interface PublicCategory {
  name: string;
  slug: string;
}
