import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategories,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/actions/categories";
import { handleAndToastError } from "@/lib/error-handler";

export const CATEGORIES_QUERY_KEY = "categories";
export const ADMIN_CATEGORIES_QUERY_KEY = "admin-categories";

export function useCategories() {
  return useQuery({
    queryKey: [CATEGORIES_QUERY_KEY],
    queryFn: getCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
  });
}

export function useAdminCategories() {
  return useQuery({
    queryKey: [ADMIN_CATEGORIES_QUERY_KEY],
    queryFn: getAdminCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryData: any) => createCategory(categoryData),
    onSuccess: () => {
      // Invalidate both categories queries
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [ADMIN_CATEGORIES_QUERY_KEY] });
    },
    onError: (error: any) => {
      handleAndToastError(error, "Failed to create category.");
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      updateData,
    }: {
      categoryId: string;
      updateData: any;
    }) => updateCategory(categoryId, updateData),
    onSuccess: () => {
      // Invalidate both categories queries
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [ADMIN_CATEGORIES_QUERY_KEY] });
    },
    onError: (error: any) => {
      handleAndToastError(error, "Failed to update category.");
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) => deleteCategory(categoryId),
    onSuccess: () => {
      // Invalidate both categories queries
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [ADMIN_CATEGORIES_QUERY_KEY] });
    },
    onError: (error: any) => {
      handleAndToastError(error, "Failed to delete category.");
    },
  });
}
