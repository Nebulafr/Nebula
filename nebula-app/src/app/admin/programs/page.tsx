 
"use client";

import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Trash2,
  ChevronDown,
  Check,
  Plus,
  Loader2,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAdminPrograms, useCategories, useUpdateProgramStatus, useCreateCategory, useDeleteProgram, useDeleteCategory } from "@/hooks";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { AdminPagination } from "../components/admin-pagination";

export default function AdminProgramsPage() {
  const t = useTranslations("dashboard.admin");
  const tc = useTranslations("common");
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);
  const [programToDelete, setProgramToDelete] = useState<any>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: categoriesResponse } = useCategories();
  const categories = categoriesResponse?.data?.categories || [];
  const categoryNames = categories.map((c: any) => c.name);

  const { data: programsResponse, isLoading } = useAdminPrograms({
    search: searchTerm || undefined,
    category: activeCategory !== "All" ? activeCategory : undefined,
    page,
    limit,
  });

  const programs = programsResponse?.programs || [];
  const pagination = programsResponse?.pagination;
  const updateProgramStatusMutation = useUpdateProgramStatus();
  const createCategoryMutation = useCreateCategory();
  const deleteProgramMutation = useDeleteProgram();
  const deleteCategoryMutation = useDeleteCategory();

  const handleAddCategory = async () => {
    if (newCategory.trim() && !categoryNames.includes(newCategory.trim())) {
      try {
        await createCategoryMutation.mutateAsync({ name: newCategory.trim() });
      } catch (error) {
        // Error handled by hook
      }
    }
    setNewCategory("");
    setIsAddingCategory(false);
  };

  const handleCategorySelect = (category: string) => {
    setActiveCategory(category);
    setIsAddingCategory(false);
    setPage(1); // Reset page on category change
  };
  const handleDeleteCategory = async (category: any) => {
    if (!category?.id) return;
    try {
      await deleteCategoryMutation.mutateAsync(category.id);
      toast.success(t("categoryDeletedSuccess") || "Category deleted successfully");
    } catch (error) {
      // Error handled by hook
    } finally {
      setCategoryToDelete(null);
    }
  };

  // Debounce search term and reset page
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleProgramAction = async (
    programId: string,
    action: "approve" | "reject" | "activate" | "deactivate"
  ) => {
    setActionInProgress(`${programId}-${action}`);
    try {
      await updateProgramStatusMutation.mutateAsync({ programId, action });
    } catch (error) {
      // Error handled by hook
    } finally {
      setActionInProgress(null);
    }
  };

  const isActionPending = (programId: string, action: string) => {
    return actionInProgress === `${programId}-${action}`;
  };
  const handleViewDetails = (program: any) => {
    router.push(`/admin/programs/${program.slug}`);
  };

  const getStatusBadgeVariant = (status: string) => {
    if (status === "ACTIVE") return "default";
    if (status === "PENDING_APPROVAL") return "secondary";
    if (status === "REJECTED") return "destructive";
    return "outline";
  };

  const handleDeleteProgram = async () => {
    if (!programToDelete) return;
    setActionInProgress(`${programToDelete.id}-delete`);
    try {
      await deleteProgramMutation.mutateAsync(programToDelete.id);
      toast.success(t("programDeletedSuccess") || "Program deleted successfully");
    } catch (error) {
      // Error handled by hook
    } finally {
      setActionInProgress(null);
      setProgramToDelete(null);
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === "PENDING_APPROVAL") return t("statusPendingApproval") || "Pending Approval";
    if (status === "ACTIVE") return t("statusActive") || "Active";
    if (status === "INACTIVE") return t("statusInactive") || "Inactive";
    if (status === "REJECTED") return t("statusRejected") || "Rejected";
    return status;
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("searchPrograms")}
                className="pl-9"
                value={searchTerm || ""}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className={cn(
                  "rounded-full",
                  activeCategory === "All" && "bg-muted font-bold"
                )}
                onClick={() => handleCategorySelect("All")}
              >
                {t("all")}
              </Button>
              <DropdownMenu
                onOpenChange={(open) => !open && setIsAddingCategory(false)}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "rounded-full flex items-center gap-1",
                      activeCategory !== "All" && "bg-muted font-bold"
                    )}
                  >
                    {t("categories")} <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isAddingCategory ? (
                    <div
                      className="p-2 flex items-center gap-2"
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <Input
                        placeholder={t("newCategoryPlaceholder")}
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleAddCategory()
                        }
                        autoFocus
                      />
                      <Button size="icon" onClick={handleAddCategory}>
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      {categories.map((cat: any) => (
                        <DropdownMenuItem
                          key={cat.id}
                          onSelect={(e) => e.preventDefault()}
                        >
                          <span
                            onClick={() => handleCategorySelect(cat.name)}
                            className="flex-grow p-2 -m-2"
                          >
                            {cat.name}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setCategoryToDelete(cat)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          setIsAddingCategory(true);
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {t("addCategory")}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("programTitle")}</TableHead>
                <TableHead>{t("coach")}</TableHead>
                <TableHead>{t("category")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead>{t("created")}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    {t("loadingPrograms")}
                  </TableCell>
                </TableRow>
              ) : programs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    {t("noProgramsFound")}
                  </TableCell>
                </TableRow>
              ) : (
                programs.map((program: any) => (
                  <TableRow key={program.id}>
                    <TableCell className="font-medium">
                      {program.title}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={program.coach?.user?.avatarUrl} />
                          <AvatarFallback>
                            {program.coach?.user?.fullName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{program.coach?.user?.fullName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{program.category?.name}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(program.status)}>
                        {getStatusLabel(program.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(program.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => handleViewDetails(program)}
                          >
                            {t("viewDetails")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {program.status === "PENDING_APPROVAL" && (
                            <>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleProgramAction(program.id, "approve")
                                }
                                disabled={isActionPending(program.id, "approve")}
                              >
                                {isActionPending(program.id, "approve") ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                )}
                                {t("approve")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() =>
                                  handleProgramAction(program.id, "reject")
                                }
                                disabled={isActionPending(program.id, "reject")}
                              >
                                {isActionPending(program.id, "reject") ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <XCircle className="mr-2 h-4 w-4" />
                                )}
                                {t("reject")}
                              </DropdownMenuItem>
                            </>
                          )}
                          {program.status === "ACTIVE" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleProgramAction(program.id, "deactivate")
                              }
                              disabled={isActionPending(program.id, "deactivate")}
                            >
                              {isActionPending(program.id, "deactivate") ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="mr-2 h-4 w-4" />
                              )}
                              {t("deactivate")}
                            </DropdownMenuItem>
                          )}
                          {program.status === "INACTIVE" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleProgramAction(program.id, "activate")
                              }
                              disabled={isActionPending(program.id, "activate")}
                            >
                              {isActionPending(program.id, "activate") ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="mr-2 h-4 w-4" />
                              )}
                              {t("activate")}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setProgramToDelete(program)}
                            disabled={isActionPending(program.id, "delete")}
                          >
                            {isActionPending(program.id, "delete") ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            {t("delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

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
        </CardContent>
      </Card>
      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={() => setCategoryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("areYouSure")}</AlertDialogTitle>
            <AlertDialogDescription>
              {categoryToDelete && (t("deleteCategoryDesc", { name: categoryToDelete.name }) || `This will permanently delete the "${categoryToDelete.name}" category. This action cannot be undone.`)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCategoryMutation.isPending}>{t("cancel")}</AlertDialogCancel>
            <Button
              onClick={() => handleDeleteCategory(categoryToDelete)}
              variant="destructive"
              disabled={deleteCategoryMutation.isPending}
            >
              {deleteCategoryMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t("delete")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!programToDelete}
        onOpenChange={(open) => !open && !isActionPending(programToDelete?.id, "delete") && setProgramToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("areYouSure")}</AlertDialogTitle>
            <AlertDialogDescription>
              {programToDelete &&
                (t("deleteProgramDesc", { title: programToDelete.title }) ||
                  `Are you sure you want to delete the program "${programToDelete.title}"? This action cannot be undone.`)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActionPending(programToDelete?.id, "delete")}>{t("cancel")}</AlertDialogCancel>
            <Button
              onClick={handleDeleteProgram}
              variant="destructive"
              disabled={isActionPending(programToDelete?.id, "delete")}
            >
              {isActionPending(programToDelete?.id, "delete") ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                t("delete")
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
