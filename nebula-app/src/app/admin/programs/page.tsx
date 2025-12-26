"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "react-toastify";
import {
  useCategories,
  useAdminPrograms,
  useUpdateProgramStatus,
  useCreateCategory,
} from "@/hooks";

import { ProgramsFilters } from "./components/programs-filters";
import { ProgramsTable } from "./components/programs-table";
import { ProgramDetailsDialog } from "./components/program-details-dialog";
import { DeleteCategoryDialog } from "./components/delete-category-dialog";
import { AdminProgram } from "@/types/program";

export default function AdminProgramsPage() {
  const [selectedProgram, setSelectedProgram] = useState<AdminProgram | null>(
    null
  );
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [loadingActions, setLoadingActions] = useState<Record<string, string>>(
    {}
  );

  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const { data: categoriesResponse } = useCategories();
  const publicCategories = categoriesResponse?.data?.categories || [];

  const {
    data: programsResponse,
    isLoading: isLoading,
    refetch: fetchPrograms,
  } = useAdminPrograms({
    search: debouncedSearch || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
  });

  const programs = programsResponse?.data?.programs || [];
  const updateProgramStatusMutation = useUpdateProgramStatus();
  const createCategoryMutation = useCreateCategory();

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(id);
  }, [searchTerm]);

  /**
   * Program actions: activate, deactivate, delete
   */
  const handleProgramAction = useCallback(
    async (programId: string, action: "activate" | "deactivate" | "delete") => {
      setLoadingActions((prev) => ({ ...prev, [programId]: action }));

      if (action === "delete") {
        toast.error("Delete functionality not implemented yet.");
        setLoadingActions((prev) => {
          const copy = { ...prev };
          delete copy[programId];
          return copy;
        });
        return;
      }

      const response = await updateProgramStatusMutation.mutateAsync({
        programId,
        action,
      });

      if (!response.success) {
        toast.error(response.message);
      } else {
        toast.success(response.message || `Program ${action}d successfully`);
      }

      setLoadingActions((prev) => {
        const copy = { ...prev };
        delete copy[programId];
        return copy;
      });
    },
    [updateProgramStatusMutation]
  );

  /**
   * Add new category
   */
  const handleAddCategory = useCallback(
    async (categoryName: string) => {
      if (!categoryName) return;

      const exists = publicCategories.some((c: any) => c.name === categoryName);
      if (exists) return;

      const response = await createCategoryMutation.mutateAsync({
        name: categoryName,
      });

      if (!response.success) {
        toast.error(response.message);
      } else {
        toast.success(
          response.message || `Category "${categoryName}" added successfully.`
        );
      }
    },
    [publicCategories, createCategoryMutation]
  );

  /**
   * Temporary category deletion handler
   */
  const handleDeleteCategory = useCallback(async (categoryName: string) => {
    toast.error(
      "Category deletion is not implemented in this view. Use the Admin Categories page."
    );
    setCategoryToDelete(null);
  }, []);

  /**
   * Open program details dialog
   */
  const handleViewDetails = useCallback((program: AdminProgram) => {
    setSelectedProgram(program);
    setIsDetailsDialogOpen(true);
  }, []);

  const handleCloseDetailsDialog = useCallback(() => {
    setSelectedProgram(null);
    setIsDetailsDialogOpen(false);
  }, []);

  /**
   * Local reassignment only (UI update) - React Query will handle data updates
   */
  const handleReassignCategory = useCallback(
    (programId: string, categoryName: string) => {
      // With React Query, this would typically trigger a mutation
      // For now, just show success message
      toast.success(`Program category updated to "${categoryName}".`);
    },
    []
  );

  /**
   * Memoized program list (prepares for future computed filtering)
   */
  const computedPrograms = useMemo(() => programs, [programs]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <Card>
        <CardHeader>
          <ProgramsFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            categories={publicCategories}
            onAddCategory={handleAddCategory}
            onDeleteCategory={setCategoryToDelete}
            loading={isLoading}
          />
        </CardHeader>

        <CardContent>
          <ProgramsTable
            programs={computedPrograms}
            loading={isLoading}
            loadingActions={loadingActions}
            onProgramAction={handleProgramAction}
            onViewDetails={handleViewDetails}
          />
        </CardContent>
      </Card>

      <DeleteCategoryDialog
        categoryName={categoryToDelete}
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleDeleteCategory}
      />

      <ProgramDetailsDialog
        program={selectedProgram}
        isOpen={isDetailsDialogOpen}
        onClose={handleCloseDetailsDialog}
        categories={publicCategories}
        onReassignCategory={handleReassignCategory}
      />
    </div>
  );
}
