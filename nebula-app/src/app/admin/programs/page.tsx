"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "react-toastify";
import {
  getAdminPrograms,
  updateProgramStatus,
} from "@/actions/admin/programs";
import { ProgramStatus } from "@/generated/prisma";
import { createCategory } from "@/actions/admin/categories";
import { useCategories } from "@/contexts/category-context";

import { ProgramsFilters } from "./components/programs-filters";
import { ProgramsTable } from "./components/programs-table";
import { ProgramDetailsDialog } from "./components/program-details-dialog";
import { DeleteCategoryDialog } from "./components/delete-category-dialog";
import { AdminProgram } from "@/types/program";

const mockPrograms: AdminProgram[] = [
  {
    id: "1",
    title: "Advanced System Design",
    categoryId: "cat-1",
    description:
      "Learn how to design large-scale distributed systems with real-world examples and hands-on projects.",
    objectives: [
      "Master system architecture",
      "Learn scalability patterns",
      "Understand distributed systems",
    ],
    coachId: "coach-1",
    slug: "advanced-system-design",
    rating: 4.8,
    totalReviews: 0,
    price: 299,
    duration: "8 weeks",
    difficultyLevel: "BEGINNER",
    maxStudents: 20,
    currentEnrollments: 0,
    isActive: false,
    status: ProgramStatus.INACTIVE,
    tags: [],
    prerequisites: [],
    createdAt: new Date("2024-01-15T10:00:00Z"),
    updatedAt: new Date("2024-01-15T10:00:00Z"),
    category: { id: "cat-1", name: "Engineering" },
    coach: {
      id: "coach-1",
      user: {
        fullName: "Adrian Cucurella",
        avatarUrl: "https://i.pravatar.cc/40?u=adrian",
      },
    },
  },
  {
    id: "2",
    title: "Product Management Masterclass",
    categoryId: "cat-2",
    description:
      "Comprehensive guide to product management from ideation to launch.",
    objectives: [
      "Learn product strategy",
      "Master user research",
      "Understand market analysis",
    ],
    coachId: "coach-2",
    slug: "product-management-masterclass",
    rating: 4.6,
    totalReviews: 0,
    price: 199,
    duration: "6 weeks",
    difficultyLevel: "INTERMEDIATE",
    maxStudents: 25,
    currentEnrollments: 15,
    isActive: true,
    status: ProgramStatus.ACTIVE,
    tags: [],
    prerequisites: [],
    createdAt: new Date("2024-01-10T14:30:00Z"),
    updatedAt: new Date("2024-01-10T14:30:00Z"),
    category: { id: "cat-2", name: "Product" },
    coach: {
      id: "coach-2",
      user: {
        fullName: "Sarah Johnson",
        avatarUrl: "https://i.pravatar.cc/40?u=sarah",
      },
    },
  },
  {
    id: "3",
    title: "Data Science Fundamentals",
    categoryId: "cat-3",
    description:
      "Learn the basics of data science, machine learning, and statistical analysis.",
    objectives: [
      "Master Python data analysis",
      "Learn machine learning",
      "Understand statistics",
    ],
    coachId: "coach-3",
    slug: "data-science-fundamentals",
    rating: 4.4,
    totalReviews: 0,
    price: 249,
    duration: "10 weeks",
    difficultyLevel: "ADVANCED",
    maxStudents: 30,
    currentEnrollments: 0,
    isActive: false,
    status: ProgramStatus.INACTIVE,
    tags: [],
    prerequisites: [],
    createdAt: new Date("2024-01-08T09:15:00Z"),
    updatedAt: new Date("2024-01-08T09:15:00Z"),
    category: { id: "cat-3", name: "Data Science" },
    coach: {
      id: "coach-3",
      user: {
        fullName: "Michael Chen",
        avatarUrl: "https://i.pravatar.cc/40?u=michael",
      },
    },
  },
  {
    id: "4",
    title: "UX Design Workshop",
    categoryId: "cat-4",
    description:
      "Hands-on workshop covering user research, wireframing, and prototyping.",
    objectives: [
      "Learn user research methods",
      "Master wireframing",
      "Create prototypes",
    ],
    coachId: "coach-4",
    slug: "ux-design-workshop",
    rating: 4.7,
    totalReviews: 0,
    price: 179,
    duration: "4 weeks",
    difficultyLevel: "BEGINNER",
    maxStudents: 15,
    currentEnrollments: 8,
    isActive: false,
    status: ProgramStatus.INACTIVE,
    tags: [],
    prerequisites: [],
    createdAt: new Date("2024-01-05T16:45:00Z"),
    updatedAt: new Date("2024-01-05T16:45:00Z"),
    category: { id: "cat-4", name: "Design" },
    coach: {
      id: "coach-4",
      user: {
        fullName: "Emma Wilson",
        avatarUrl: "https://i.pravatar.cc/40?u=emma",
      },
    },
  },
];

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<AdminProgram[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<AdminProgram | null>(
    null
  );
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [isLoading, setIsLoading] = useState(true);
  const [loadingActions, setLoadingActions] = useState<Record<string, string>>(
    {}
  );

  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const { categories: publicCategories, refetch: refetchCategories } =
    useCategories();

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(id);
  }, [searchTerm]);

  const fetchPrograms = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await getAdminPrograms({
        search: debouncedSearch || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
      });

      if (response.success && response.data) {
        setPrograms(response.data.programs);
      } else {
        setPrograms(mockPrograms);
      }
    } catch {
      setPrograms(mockPrograms);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, statusFilter, categoryFilter]);

  /**
   * Trigger fetch when filters or debounced search change
   */
  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  /**
   * Program actions: activate, deactivate, delete
   */
  const handleProgramAction = useCallback(
    async (programId: string, action: "activate" | "deactivate" | "delete") => {
      try {
        setLoadingActions((prev) => ({ ...prev, [programId]: action }));

        if (action === "delete") {
          toast.error("Delete functionality not implemented yet.");
          return;
        }

        const response = await updateProgramStatus(programId, action);
        if (!response.success) throw new Error(response.error);

        setPrograms((prev) =>
          prev.map((p) =>
            p.id === programId
              ? {
                  ...p,
                  status:
                    action === "activate"
                      ? ProgramStatus.ACTIVE
                      : ProgramStatus.INACTIVE,
                  isActive: action === "activate",
                }
              : p
          )
        );

        toast.success(response.message ?? `Program ${action}d successfully`);
      } catch (e: any) {
        toast.error(e?.message ?? `Failed to ${action} program.`);
      } finally {
        setLoadingActions((prev) => {
          const copy = { ...prev };
          delete copy[programId];
          return copy;
        });
      }
    },
    []
  );

  /**
   * Add new category
   */
  const handleAddCategory = useCallback(
    async (categoryName: string) => {
      if (!categoryName) return;

      const exists = publicCategories.some((c) => c.name === categoryName);
      if (exists) return;

      try {
        const response = await createCategory({ name: categoryName });
        if (!response.success || !response.data?.category)
          throw new Error(response.error);

        toast.success(`Category "${categoryName}" added successfully.`);
        await refetchCategories();
      } catch (e: any) {
        toast.error(e?.message ?? "Failed to create category.");
      }
    },
    [publicCategories, refetchCategories]
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
   * Local reassignment only (UI update)
   */
  const handleReassignCategory = useCallback(
    (programId: string, categoryName: string) => {
      setPrograms((prev) =>
        prev.map((p) =>
          p.id === programId
            ? { ...p, category: { ...p.category, name: categoryName } }
            : p
        )
      );
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
