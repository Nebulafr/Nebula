"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  MoreHorizontal,
  Briefcase,
  GraduationCap,
  Star,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProgram, getPrograms } from "@/actions/programs";
import { toast } from "react-toastify";
import Link from "next/link";
import { useCategories } from "@/contexts/CategoryContext";
import { ModuleFormData } from "@/types";
import ModulesForm from "@/components/ModuleForm";
import { createProgramSchema } from "@/lib/validations";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { UserProfile } from "@/hooks/use-user";
import { IProgram, ProgramCard } from "./components/program-card";

const mockPrograms: IProgram[] = [
  {
    id: "program-1",
    title: "Product Manager Interview Prep",
    slug: "pm-interview-prep",
    description:
      "Comprehensive preparation for product manager interviews at top tech companies. Covers case studies, behavioral questions, and portfolio building.",
    category: {
      name: "Career Prep",
      slug: "career-prep",
    },
    price: 299,
    duration: "4 weeks",
    difficultyLevel: "INTERMEDIATE",
    rating: 4.9,
    totalReviews: 45,
    isActive: true,
    status: "ACTIVE",
    coachId: "coach-1",
    maxStudents: 20,
    currentEnrollments: 15,
    tags: ["Product Management", "Interviews", "Tech"],
    prerequisites: ["Basic understanding of product management"],
    objectives: [
      "Master product manager interview formats",
      "Build compelling product portfolio",
      "Practice case study frameworks",
      "Develop storytelling skills",
    ],
    modules: [
      {
        title: "Product Strategy & Vision",
        week: 1,
        description: "Foundation concepts",
      },
      {
        title: "Technical Product Management",
        week: 2,
        description: "Technical skills",
      },
      {
        title: "Data Analysis & Metrics",
        week: 3,
        description: "Analytics focus",
      },
      {
        title: "Mock Interviews & Final Review",
        week: 4,
        description: "Practice sessions",
      },
    ],
    coach: {
      name: "Sarah Chen",
      role: "Senior PM, Google",
      avatar: "https://i.pravatar.cc/40?u=sarah-chen",
      email: "sarah.chen@example.com",
    },
    attendees: [
      "https://i.pravatar.cc/40?u=student-1",
      "https://i.pravatar.cc/40?u=student-2",
      "https://i.pravatar.cc/40?u=student-3",
    ],
    otherAttendees: 12,
    categoryId: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "program-2",
    title: "Consulting Case Interview Mastery",
    slug: "consulting-case-prep",
    description:
      "Master the art of case interviews for top consulting firms like McKinsey, Bain, and BCG. Learn frameworks and practice real cases.",
    category: {
      name: "Career Prep",
      slug: "career-prep",
    },
    price: 399,
    duration: "6 weeks",
    difficultyLevel: "ADVANCED",
    rating: 4.8,
    totalReviews: 32,
    isActive: true,
    status: "ACTIVE",
    coachId: "coach-2",
    maxStudents: 15,
    currentEnrollments: 12,
    tags: ["Consulting", "Case Interviews", "MBB"],
    prerequisites: ["Business fundamentals", "Basic quantitative skills"],
    objectives: [
      "Master case interview frameworks",
      "Develop structured thinking",
      "Practice mental math",
      "Build communication skills",
    ],
    modules: [
      {
        title: "Case Interview Fundamentals",
        week: 1,
        description: "Core concepts",
      },
      {
        title: "Market Sizing & Estimation",
        week: 2,
        description: "Quantitative skills",
      },
      {
        title: "Profitability Cases",
        week: 3,
        description: "Financial analysis",
      },
      {
        title: "Market Entry & Growth",
        week: 4,
        description: "Strategic thinking",
      },
      {
        title: "Operations & Process",
        week: 5,
        description: "Operational excellence",
      },
      {
        title: "Final Preparation & Mock Interviews",
        week: 6,
        description: "Practice and review",
      },
    ],
    coach: {
      name: "Marcus Johnson",
      role: "Partner, McKinsey",
      avatar: "https://i.pravatar.cc/40?u=marcus-johnson",
      email: "marcus.johnson@example.com",
    },
    attendees: [
      "https://i.pravatar.cc/40?u=student-4",
      "https://i.pravatar.cc/40?u=student-5",
      "https://i.pravatar.cc/40?u=student-6",
    ],
    otherAttendees: 9,
    categoryId: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function CoachProgramsPage() {
  const { profile, coachProfile } = useAuth();
  const [programs, setPrograms] = useState<IProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!coachProfile) return;

    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const result = await getPrograms({ coachId: coachProfile!.id });
        if (result.success) {
          setPrograms(result.programs);
        } else {
          console.error("Error fetching programs:", result.error);
          setPrograms([]);
        }
      } catch (error) {
        console.error("Error fetching programs:", error);
        setPrograms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, [coachProfile]);

  const refreshPrograms = async () => {
    if (!coachProfile) return;
    try {
      const result = await getPrograms({ coachId: coachProfile.id });
      if (result.success) {
        setPrograms(result.programs);
      } else {
        console.error("Error refreshing programs:", result.error);
        setPrograms([]);
      }
    } catch (error) {
      console.error("Error refreshing programs:", error);
      setPrograms([]);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">My Programs</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-4" />
                <div className="flex gap-4">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">My Programs</h2>
        <CreateProgramDialog
          user={profile!}
          onProgramCreated={refreshPrograms}
        />
      </div>

      {programs.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Briefcase className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No programs yet</h3>
                <p className="text-muted-foreground">
                  Create your first program to get started.
                </p>
              </div>
              <CreateProgramDialog
                user={profile!}
                onProgramCreated={refreshPrograms}
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      )}
    </div>
  );
}

function CreateProgramDialog({
  onProgramCreated,
  user: profile,
}: {
  onProgramCreated?: () => void;
  user: UserProfile;
}) {
  const { categories, loading: categoriesLoading } = useCategories();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [objectives, setObjectives] = useState("");

  const [modules, setModules] = useState<ModuleFormData[]>([]);

  const handleNext = () => {
    if (currentStep === 1) {
      try {
        const step1Data = {
          title: title.trim(),
          category: category.trim(),
          description: description.trim(),
          objectives: objectives.split("\n").filter((o) => o.trim() !== ""),
        };

        if (!category || category === "loading" || category === "none") {
          toast.error("Please select a valid category.");
          return;
        }

        createProgramSchema
          .pick({
            title: true,
            category: true,
            description: true,
            objectives: true,
          })
          .parse(step1Data);

        setCurrentStep(2);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errorMessage =
            error.errors[0]?.message ||
            "Please fill in all required fields correctly.";
          toast.error(errorMessage);
        }
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const resetForm = () => {
    setTitle("");
    setCategory("");
    setDescription("");
    setObjectives("");
    setModules([]);
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      toast.error("You must be logged in.");
      return;
    }

    try {
      setLoading(true);

      if (!category || category === "loading" || category === "none") {
        toast.error("Please select a valid category.");
        return;
      }

      const programData = {
        title: title.trim(),
        category: category.trim(),
        description: description.trim(),
        objectives: objectives.split("\n").filter((o) => o.trim() !== ""),
        modules,
      };

      createProgramSchema.parse(programData);

      const result = await createProgram(programData);

      console.log({ result });

      if (result.success) {
        toast.success(result.message || "Your new program has been created.");

        setOpen(false);
        resetForm();
        onProgramCreated?.();
      } else {
        toast.error(result.message || "Could not create the program.");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors.map((err) => err.message).join(", ");
        toast.error(errorMessage);
      } else {
        toast.error("Could not create the program.");
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDialogChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Program
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Create New Program - Step {currentStep} of 2
          </DialogTitle>
          <DialogDescription>
            {currentStep === 1
              ? "Fill out the basic details for your coaching program."
              : "Add modules to structure your program content."}
          </DialogDescription>

          {/* Progress indicator */}
          <div className="flex space-x-2 pt-2">
            <div
              className={`h-2 flex-1 rounded ${
                currentStep >= 1 ? "bg-primary" : "bg-muted"
              }`}
            />
            <div
              className={`h-2 flex-1 rounded ${
                currentStep >= 2 ? "bg-primary" : "bg-muted"
              }`}
            />
          </div>
        </DialogHeader>

        <form
          onSubmit={
            currentStep === 2
              ? handleSubmit
              : (e) => {
                  e.preventDefault();
                  handleNext();
                }
          }
          className="space-y-6"
        >
          {currentStep === 1 && (
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Consulting Bootcamp"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Category</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading categories...
                      </SelectItem>
                    ) : categories.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No categories available
                      </SelectItem>
                    ) : (
                      categories.map((cat) => (
                        <SelectItem key={cat.name} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="col-span-3"
                  placeholder="Brief description of your program..."
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Objectives</Label>
                <Textarea
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter one objective per line..."
                  required
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-muted/20">
                <h3 className="text-lg font-semibold mb-3">Program Modules</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Structure your program content by adding modules. Each module
                  represents a key topic or week in your program.
                </p>
                <ModulesForm onChange={(mods) => setModules(mods)} />
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline" disabled={loading}>
                Cancel
              </Button>
            </DialogClose>

            {currentStep === 2 && (
              <Button type="button" variant="outline" onClick={handlePrevious}>
                Previous
              </Button>
            )}

            {currentStep === 1 ? (
              <Button type="submit">Next: Add Modules</Button>
            ) : (
              <Button type="submit" disabled={loading || modules.length === 0}>
                {loading ? "Creating..." : "Create Program"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
