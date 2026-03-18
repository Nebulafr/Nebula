"use client";

import React, { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks";
import { CategoriesGrid } from "./components/categories-grid";
import { CategoryDialog } from "./components/category-dialog";
import { AdminPagination } from "../components/admin-pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "react-toastify";

export default function AdminCategoriesPage() {
  const t = useTranslations("dashboard.admin");
  const tc = useTranslations("common");

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);
  const [page, setPage] = useState(1);
  const limit = 8;

  const { data: categoriesResponse, isLoading } = useAdminCategories({
    page,
    limit,
    search: searchTerm || undefined,
  });
  const categories = categoriesResponse?.data?.categories || [];
  const pagination = categoriesResponse?.data?.pagination;

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  // Debounce search term and reset page
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleAddClick = () => {
    setSelectedCategory(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (category: any) => {
    setSelectedCategory(category);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedCategory) {
        await updateCategoryMutation.mutateAsync({
          categoryId: selectedCategory.id,
          updateData: data,
        });
        toast.success(t("categoryUpdatedSuccess") || "Category updated successfully");
      } else {
        await createCategoryMutation.mutateAsync(data);
        toast.success(t("categoryCreatedSuccess") || "Category created successfully");
      }
      setIsDialogOpen(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleToggleStatus = async (category: any) => {
    try {
      await updateCategoryMutation.mutateAsync({
        categoryId: category.id,
        updateData: { isActive: !category.isActive },
      });
      toast.success(t("categoryUpdatedSuccess") || "Category status updated");
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategoryMutation.mutateAsync(categoryToDelete.id);
      toast.success(t("categoryDeletedSuccess"));
      setCategoryToDelete(null);
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("searchCategories")}
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" />
          {t("addCategory")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("categoryManagement")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center">{tc("loading")}</div>
          ) : (
            <>
              <CategoriesGrid
                categories={categories}
                onEdit={handleEditClick}
                onToggleStatus={handleToggleStatus}
                onDelete={(cat) => setCategoryToDelete(cat)}
              />
              {pagination && (
                <AdminPagination
                  total={pagination.total}
                  page={page}
                  limit={limit}
                  totalPages={pagination.totalPages}
                  onPageChange={setPage}
                  isLoading={isLoading}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      <CategoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        category={selectedCategory}
        onSubmit={handleSubmit}
        isPending={createCategoryMutation.isPending || updateCategoryMutation.isPending}
      />

      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={() => setCategoryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("areYouSure")}</AlertDialogTitle>
            <AlertDialogDescription>
              {categoryToDelete &&
                (t("deleteCategoryDesc", { name: categoryToDelete.name }) ||
                  `This will permanently delete the "${categoryToDelete.name}" category. This action cannot be undone.`)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
              disabled={deleteCategoryMutation.isPending}
            >
              {deleteCategoryMutation.isPending ? t("deleting") : t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
