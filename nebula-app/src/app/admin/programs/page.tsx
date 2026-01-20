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
import {
  useAdminPrograms,
  useCategories,
  useUpdateProgramStatus,
  useCreateCategory,
} from "@/hooks";
import { toast } from "react-toastify";

export default function AdminProgramsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const { data: categoriesResponse } = useCategories();
  const categories =
    categoriesResponse?.data?.categories?.map((c: any) => c.name) || [];

  const { data: programsResponse, isLoading } = useAdminPrograms({
    search: searchTerm || undefined,
    category: activeCategory !== "All" ? activeCategory : undefined,
  });

  const programs = programsResponse?.data?.programs || [];
  const updateProgramStatusMutation = useUpdateProgramStatus();
  const createCategoryMutation = useCreateCategory();

  const handleAddCategory = async () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
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
  };

  const handleDeleteCategory = (category: string) => {
    toast.error("Category deletion not implemented");
    setCategoryToDelete(null);
  };

  const filteredPrograms = programs.filter((program: any) => {
    const categoryMatch =
      activeCategory === "All" || program.category?.name === activeCategory;
    const searchMatch =
      program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.coach?.user?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const handleProgramAction = async (
    programId: string,
    action: "approve" | "reject" | "activate" | "deactivate"
  ) => {
    try {
      await updateProgramStatusMutation.mutateAsync({ programId, action });
    } catch (error) {
      // Error handled by hook
    }
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

  const getStatusLabel = (status: string) => {
    if (status === "PENDING_APPROVAL") return "Pending Approval";
    if (status === "ACTIVE") return "Active";
    if (status === "INACTIVE") return "Inactive";
    if (status === "REJECTED") return "Rejected";
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
                placeholder="Search programs or coaches..."
                className="pl-9"
                value={searchTerm}
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
                All
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
                    Categories <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isAddingCategory ? (
                    <div
                      className="p-2 flex items-center gap-2"
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <Input
                        placeholder="New category..."
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
                      {categories.map((cat: string) => (
                        <DropdownMenuItem
                          key={cat}
                          onSelect={(e) => e.preventDefault()}
                        >
                          <span
                            onClick={() => handleCategorySelect(cat)}
                            className="flex-grow p-2 -m-2"
                          >
                            {cat}
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
                        Add Category
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
                <TableHead>Program Title</TableHead>
                <TableHead>Coach</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading programs...
                  </TableCell>
                </TableRow>
              ) : filteredPrograms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No programs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPrograms.map((program: any) => (
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
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {program.status === "PENDING_APPROVAL" && (
                            <>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleProgramAction(program.id, "approve")
                                }
                              >
                                <CheckCircle className="mr-2 h-4 w-4" /> Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() =>
                                  handleProgramAction(program.id, "reject")
                                }
                              >
                                <XCircle className="mr-2 h-4 w-4" /> Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {program.status === "ACTIVE" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleProgramAction(program.id, "deactivate")
                              }
                            >
                              <XCircle className="mr-2 h-4 w-4" /> Deactivate
                            </DropdownMenuItem>
                          )}
                          {program.status === "INACTIVE" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleProgramAction(program.id, "activate")
                              }
                            >
                              <CheckCircle className="mr-2 h-4 w-4" /> Activate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={() => setCategoryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the &quot;{categoryToDelete}&quot;
              category. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteCategory(categoryToDelete!)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
