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
import { useUser } from "@/hooks/use-user";
import { createProgram, getPrograms } from "@/actions/programs";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import type { IProgram } from "@/models";
import { ModuleFormData } from "@/types";
import ModulesForm from "@/components/ModuleForm";
import { createProgramSchema } from "@/lib/validations";
import { z } from "zod";

const mockPrograms: IProgram[] = [
  {
    id: "mock-1",
    title: "Consulting, Associate Level",
    category: "Career Prep",
    slug: "consulting-associate-level",
    rating: 4.9,
    currentEnrollments: 58,
    description: "Prepare for associate-level consulting positions",
    objectives: [
      "Case study preparation",
      "Interview skills",
      "Industry knowledge",
    ],
    coachRef: {} as any,
    isActive: true,
    totalReviews: 45,
    price: 299,
    duration: "8 weeks",
    difficultyLevel: "intermediate" as const,
    maxStudents: 20,
    tags: ["consulting", "career prep"],
    prerequisites: [],
    modules: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "mock-2",
    title: "MBA Admissions Coaching",
    category: "School Admissions",
    slug: "mba-admissions",
    rating: 4.8,
    currentEnrollments: 32,
    description: "Complete MBA application guidance",
    objectives: ["Essay writing", "Interview prep", "School selection"],
    coachRef: {} as any,
    isActive: true,
    totalReviews: 28,
    price: 499,
    duration: "12 weeks",
    difficultyLevel: "advanced" as const,
    maxStudents: 15,
    tags: ["mba", "admissions"],
    prerequisites: [],
    modules: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function CoachProgramsPage() {
  const { user } = useUser();
  const [programs, setPrograms] = useState<IProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const result = await getPrograms({ coachId: user.uid });
        if (result.success) {
          setPrograms(
            result.programs.length > 0 ? result.programs : mockPrograms
          );
        } else {
          console.error("Error fetching programs:", result.error);
          setPrograms(mockPrograms);
        }
      } catch (error) {
        console.error("Error fetching programs:", error);
        setPrograms(mockPrograms);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, [user?.uid]);

  const refreshPrograms = async () => {
    if (!user?.uid) return;
    try {
      const result = await getPrograms({ coachId: user.uid });
      if (result.success) {
        setPrograms(
          result.programs.length > 0 ? result.programs : mockPrograms
        );
      } else {
        console.error("Error refreshing programs:", result.error);
        setPrograms(mockPrograms);
      }
    } catch (error) {
      console.error("Error refreshing programs:", error);
      setPrograms(mockPrograms);
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
        <CreateProgramDialog onProgramCreated={refreshPrograms} />
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
              <CreateProgramDialog onProgramCreated={refreshPrograms} />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <Card key={program.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                      program.category === "Career Prep"
                        ? "bg-primary/10"
                        : "bg-blue-500/10"
                    }`}
                  >
                    {program.category === "Career Prep" ? (
                      <Briefcase className="h-5 w-5 text-primary" />
                    ) : (
                      <GraduationCap className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <h3 className="font-headline text-xl font-semibold">
                  {program.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {program.category}
                </p>
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span>{program.rating || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{program.currentEnrollments || 0} students</span>
                  </div>
                </div>
              </CardContent>
              <div className="p-6 pt-0">
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/programs/${program.slug}`}>View Details</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateProgramDialog({
  onProgramCreated,
}: {
  onProgramCreated?: () => void;
}) {
  const { user } = useUser();
  const { toast } = useToast();
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
        // Validate step 1 using Zod schema
        const step1Data = {
          title: title.trim(),
          category: category.trim(),
          description: description.trim(),
          objectives: objectives.split("\n").filter((o) => o.trim() !== ""),
        };

        // Partial validation for step 1
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
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: errorMessage,
          });
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
    if (!user?.uid) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in.",
      });
      return;
    }

    try {
      setLoading(true);

      // Prepare data for validation
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
        toast({
          title: "Success!",
          description: result.message || "Your new program has been created.",
        });

        setOpen(false);
        resetForm();
        onProgramCreated?.();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || "Could not create the program.",
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors.map((err) => err.message).join(", ");
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: errorMessage,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not create the program.",
        });
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
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Career Prep"
                  required
                />
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
