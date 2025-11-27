"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Search,
  Trash2,
  ChevronDown,
  Check,
  Plus,
  PauseCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getAdminPrograms,
  updateProgramStatus,
  type AdminProgram,
} from "@/actions/admin/programs";
import { ProgramStatus } from "@/generated/prisma";
import { createCategory } from "@/actions/admin/categories";
import { useCategories } from "@/contexts/CategoryContext";
import { Label } from "@radix-ui/react-label";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Using AdminProgram type from actions

// Mock data for fallback when API returns empty
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
    category: {
      id: "cat-1",
      name: "Engineering",
    },
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
    category: {
      id: "cat-2",
      name: "Product",
    },
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
    category: {
      id: "cat-3",
      name: "Data Science",
    },
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
    category: {
      id: "cat-4",
      name: "Design",
    },
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
  const [filteredPrograms, setFilteredPrograms] = useState<AdminProgram[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<AdminProgram | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingActions, setLoadingActions] = useState<Record<string, string>>(
    {}
  );
  const { categories: publicCategories, refetch: refetchCategories } =
    useCategories();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [dialogCategory, setDialogCategory] = useState("");

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setIsLoading(true);
        const response = await getAdminPrograms({
          search: searchQuery || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          category: categoryFilter !== "all" ? categoryFilter : undefined,
        });

        if (
          response.success &&
          response.data?.programs &&
          response.data.programs.length > 0
        ) {
          setPrograms(response.data.programs);
        } else {
          console.log("No programs found in API, using mock data");
          setPrograms(mockPrograms);
        }
      } catch (error) {
        console.error("Error fetching programs:", error);
        setPrograms(mockPrograms);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrograms();
  }, [searchQuery, statusFilter, categoryFilter]);

  useEffect(() => {
    setSearchQuery(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    setFilteredPrograms(programs);
  }, [programs]);

  const handleProgramAction = async (
    programId: string,
    action: "activate" | "deactivate"
  ) => {
    try {
      setLoadingActions((prev) => ({
        ...prev,
        [programId]: action,
      }));

      const response = await updateProgramStatus(programId, action);

      if (response.success) {
        setPrograms((prev) =>
          prev.map((program) =>
            program.id === programId
              ? {
                  ...program,
                  status:
                    action === "activate"
                      ? ProgramStatus.ACTIVE
                      : ProgramStatus.INACTIVE,
                  isActive: action === "activate",
                }
              : program
          )
        );

        toast.success(response.message || `Program ${action}d successfully.`);
      } else {
        throw new Error(response.error || `Failed to ${action} program`);
      }
    } catch (error: any) {
      console.error(`Error ${action}ing program:`, error);
      toast.error(error.message || `Failed to ${action} program.`);
    } finally {
      setLoadingActions((prev) => {
        const updated = { ...prev };
        delete updated[programId];
        return updated;
      });
    }
  };

  const handleCategorySelect = (category: string) => {
    setCategoryFilter(category === "All" ? "all" : category);
  };

  const handleAddCategory = async () => {
    if (
      newCategory.trim() &&
      !publicCategories.some((cat) => cat.name === newCategory.trim())
    ) {
      try {
        const response = await createCategory({ name: newCategory.trim() });

        if (response.success && response.data?.category) {
          setNewCategory("");
          setIsAddingCategory(false);
          toast.success(
            response.message ||
              `Category "${newCategory}" has been added successfully.`
          );
          await refetchCategories();
        } else {
          throw new Error(response.error || "Failed to create category");
        }
      } catch (error: any) {
        console.error("Error creating category:", error);
        toast.error(error.message || "Failed to create category.");
      }
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    try {
      const categoryToDeleteObj = publicCategories.find(
        (cat) => cat.name === categoryName
      );
      if (!categoryToDeleteObj) return;

      toast.error(
        "Category deletion from this view is not yet implemented. Please use the admin categories page."
      );
      setCategoryToDelete(null);
    } catch (error: any) {
      console.error("Error deleting category:", error);
      setCategoryToDelete(null);
      toast.error(error.message || "Failed to delete category.");
    }
  };

  const handleViewDetails = (program: AdminProgram) => {
    setSelectedProgram(program);
    setDialogCategory(program.category.name);
    setIsDetailsDialogOpen(true);
  };

  const handleReassignCategory = () => {
    if (selectedProgram) {
      setPrograms(
        programs.map((p) =>
          p.id === selectedProgram.id 
            ? { 
                ...p, 
                category: {
                  ...p.category,
                  name: dialogCategory
                }
              } 
            : p
        )
      );
      setIsDetailsDialogOpen(false);
      setSelectedProgram(null);
      toast.success(
        `Program category has been updated to "${dialogCategory}".`
      );
    }
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
              <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="inactive">Inactive</TabsTrigger>
                </TabsList>
              </Tabs>
              <DropdownMenu
                onOpenChange={(open) => !open && setIsAddingCategory(false)}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "rounded-full flex items-center gap-1",
                      categoryFilter !== "all" && "bg-muted font-bold"
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
                      {publicCategories.map((cat) => (
                        <DropdownMenuItem
                          key={cat.name}
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
                            onClick={() => setCategoryToDelete(cat.name)}
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
              {isLoading
                ? // Loading skeleton
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell className="font-medium">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse ml-auto"></div>
                      </TableCell>
                    </TableRow>
                  ))
                : filteredPrograms.map((program) => (
                    <TableRow key={program.title}>
                      <TableCell className="font-medium">
                        {program.title}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={program.coach.user.avatarUrl || undefined} />
                            <AvatarFallback>
                              {(program.coach.user.fullName || "Unknown").charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{program.coach.user.fullName || "Unknown"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{program.category.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            program.status === ProgramStatus.ACTIVE
                              ? "default"
                              : program.status === ProgramStatus.INACTIVE
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {program.status === ProgramStatus.ACTIVE
                            ? "Active"
                            : program.status === ProgramStatus.INACTIVE
                            ? "Inactive"
                            : program.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {program.createdAt
                          ? format(new Date(program.createdAt), "MMM dd, yyyy")
                          : "Unknown"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={!!loadingActions[program.id]}
                            >
                              {loadingActions[program.id] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(program)}
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {program.status === ProgramStatus.INACTIVE && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleProgramAction(program.id, "activate")
                                }
                                disabled={!!loadingActions[program.id]}
                                className="text-green-600"
                              >
                                {loadingActions[program.id] === "activate" ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                )}{" "}
                                {loadingActions[program.id] === "activate"
                                  ? "Activating..."
                                  : "Activate"}
                              </DropdownMenuItem>
                            )}
                            {program.status === ProgramStatus.ACTIVE && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleProgramAction(program.id, "deactivate")
                                }
                                disabled={!!loadingActions[program.id]}
                                className="text-orange-600"
                              >
                                {loadingActions[program.id] === "deactivate" ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <PauseCircle className="mr-2 h-4 w-4" />
                                )}{" "}
                                {loadingActions[program.id] === "deactivate"
                                  ? "Deactivating..."
                                  : "Deactivate"}
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
                  ))}
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
              This will permanently delete the &quot;
              {categoryToDelete}
              &quot; category. This action cannot be undone.
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

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          {selectedProgram && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProgram.title}</DialogTitle>
                <DialogDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={selectedProgram.coach.user.avatarUrl || undefined} />
                      <AvatarFallback>
                        {(selectedProgram.coach.user.fullName || "Unknown").charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{selectedProgram.coach.user.fullName || "Unknown"}</span>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label
                    htmlFor="program-description"
                    className="text-right pt-2"
                  >
                    Description
                  </Label>
                  <p
                    id="program-description"
                    className="col-span-3 text-sm text-muted-foreground bg-muted p-3 rounded-md"
                  >
                    {selectedProgram.description}
                  </p>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="program-category" className="text-right">
                    Category
                  </Label>
                  <Select
                    value={dialogCategory}
                    onValueChange={setDialogCategory}
                  >
                    <SelectTrigger id="program-category" className="col-span-3">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {publicCategories.map((cat) => (
                        <SelectItem key={cat.name} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDetailsDialogOpen(false)}
                  >
                    Close
                  </Button>
                </DialogClose>
                <Button type="button" onClick={handleReassignCategory}>
                  Reassign Category
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
