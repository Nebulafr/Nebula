"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, PlusCircle, Trash2, X, Loader2, Save } from "lucide-react";
import { DifficultyLevel } from "@/generated/prisma";
import { useCategories } from "@/hooks";
import { UserSelect } from "@/components/ui/user-select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPut } from "@/lib/utils";
import { toast } from "react-toastify";

interface ProgramModule {
  id?: string;
  title: string;
  week: number;
  description: string;
  materials: string[];
}

interface CoCoach {
  id: string;
  name: string;
  avatar?: string;
}

const DIFFICULTY_OPTIONS = [
  { value: DifficultyLevel.BEGINNER, label: "Beginner" },
  { value: DifficultyLevel.INTERMEDIATE, label: "Intermediate" },
  { value: DifficultyLevel.ADVANCED, label: "Advanced" },
];

export default function EditProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: categoriesResponse } = useCategories();
  const categories = (categoriesResponse as any)?.data?.categories || [];

  // Fetch program data
  const { data: programResponse, isLoading } = useQuery({
    queryKey: ["program", id],
    queryFn: () => apiGet(`/programs/id/${id}`),
    enabled: !!id,
  });

  const program = programResponse?.data?.program;

  // Form state
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: string;
    targetAudience: string;
    objectives: string[];
    modules: ProgramModule[];
    price: number;
    duration: number;
    difficultyLevel: DifficultyLevel;
    maxStudents: number;
    tags: string[];
    prerequisites: string[];
    isMultiCoach: boolean;
    coCoaches: CoCoach[];
  }>({
    title: "",
    description: "",
    category: "",
    targetAudience: "",
    objectives: [],
    modules: [],
    price: 0,
    duration: 3,
    difficultyLevel: DifficultyLevel.BEGINNER,
    maxStudents: 30,
    tags: [],
    prerequisites: [],
    isMultiCoach: false,
    coCoaches: [],
  });

  const [newObjective, setNewObjective] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newPrerequisite, setNewPrerequisite] = useState("");

  // Populate form when program loads
  useEffect(() => {
    if (program) {
      const durationMatch = program.duration?.match(/(\d+)/);
      const durationWeeks = durationMatch ? parseInt(durationMatch[1]) : 3;

      setFormData({
        title: program.title || "",
        description: program.description || "",
        category: program.categoryId || "",
        targetAudience: program.targetAudience || "",
        objectives: program.objectives || [],
        modules:
          program.modules?.map((m: any) => ({
            id: m.id,
            title: m.title,
            week: m.week,
            description: m.description,
            materials: m.materials || [],
          })) || [],
        price: program.price || 0,
        duration: durationWeeks,
        difficultyLevel: program.difficultyLevel || DifficultyLevel.BEGINNER,
        maxStudents: program.maxStudents || 30,
        tags: program.tags || [],
        prerequisites: program.prerequisites || [],
        isMultiCoach: program.coCoaches?.length > 0,
        coCoaches:
          program.coCoaches?.map((cc: any) => ({
            id: cc.coach?.user?.id,
            name: cc.coach?.user?.fullName,
            avatar: cc.coach?.user?.avatarUrl,
          })) || [],
      });
    }
  }, [program]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiPut(`/programs/id/${id}`, data);
    },
    onSuccess: () => {
      toast.success("Program updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      queryClient.invalidateQueries({ queryKey: ["program", id] });
      router.push("/coach-dashboard/programs");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update program");
    },
  });

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      updateFormData({
        objectives: [...formData.objectives, newObjective.trim()],
      });
      setNewObjective("");
    }
  };

  const handleRemoveObjective = (index: number) => {
    updateFormData({
      objectives: formData.objectives.filter((_, i) => i !== index),
    });
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      updateFormData({ tags: [...formData.tags, newTag.trim()] });
      setNewTag("");
    }
  };

  const handleRemoveTag = (index: number) => {
    updateFormData({ tags: formData.tags.filter((_, i) => i !== index) });
  };

  const handleAddPrerequisite = () => {
    if (newPrerequisite.trim()) {
      updateFormData({
        prerequisites: [...formData.prerequisites, newPrerequisite.trim()],
      });
      setNewPrerequisite("");
    }
  };

  const handleRemovePrerequisite = (index: number) => {
    updateFormData({
      prerequisites: formData.prerequisites.filter((_, i) => i !== index),
    });
  };

  const handleAddModule = () => {
    updateFormData({
      modules: [
        ...formData.modules,
        {
          title: `Week ${formData.modules.length + 1}: `,
          week: formData.modules.length + 1,
          description: "",
          materials: [],
        },
      ],
    });
  };

  const handleUpdateModule = (index: number, data: Partial<ProgramModule>) => {
    updateFormData({
      modules: formData.modules.map((m, i) =>
        i === index ? { ...m, ...data } : m,
      ),
    });
  };

  const handleRemoveModule = (index: number) => {
    updateFormData({
      modules: formData.modules
        .filter((_, i) => i !== index)
        .map((m, i) => ({ ...m, week: i + 1 })),
    });
  };

  const handleAddCoCoach = (coach: CoCoach) => {
    if (!formData.coCoaches.find((c) => c.id === coach.id)) {
      updateFormData({ coCoaches: [...formData.coCoaches, coach] });
    }
  };

  const handleRemoveCoCoach = (coachId: string) => {
    updateFormData({
      coCoaches: formData.coCoaches.filter((c) => c.id !== coachId),
    });
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.error("Program title is required");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Program description is required");
      return;
    }
    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }
    if (formData.objectives.length === 0) {
      toast.error("Please add at least one objective");
      return;
    }

    updateMutation.mutate({
      title: formData.title,
      category: formData.category,
      description: formData.description,
      targetAudience: formData.targetAudience,
      objectives: formData.objectives,
      modules: formData.modules.map((m) => ({
        title: m.title,
        week: m.week,
        description: m.description,
        materials: m.materials,
      })),
      price: formData.price,
      duration: formData.duration,
      difficultyLevel: formData.difficultyLevel,
      maxStudents: formData.maxStudents,
      tags: formData.tags,
      prerequisites: formData.prerequisites,
      coCoachIds: formData.isMultiCoach
        ? formData.coCoaches.map((c) => c.id)
        : [],
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading program...</span>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Program not found</p>
          <Button asChild className="mt-4">
            <Link href="/coach-dashboard/programs">Back to Programs</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/coach-dashboard/programs">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Program</h1>
            <p className="text-sm text-muted-foreground">{program.title}</p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Program Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                placeholder="e.g., Breaking into Product Management"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  updateFormData({ description: e.target.value })
                }
                placeholder="Describe your program..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => updateFormData({ category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input
                  id="targetAudience"
                  value={formData.targetAudience}
                  onChange={(e) =>
                    updateFormData({ targetAudience: e.target.value })
                  }
                  placeholder="e.g., Aspiring PMs with 0-2 years experience"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Program Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Program Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  value={formData.price || ""}
                  onChange={(e) =>
                    updateFormData({ price: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (weeks)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  value={formData.duration || ""}
                  onChange={(e) =>
                    updateFormData({ duration: parseInt(e.target.value) || 3 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Difficulty Level</Label>
                <Select
                  value={formData.difficultyLevel}
                  onValueChange={(value) =>
                    updateFormData({
                      difficultyLevel: value as DifficultyLevel,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxStudents">Max Students</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  min={1}
                  value={formData.maxStudents || ""}
                  onChange={(e) =>
                    updateFormData({
                      maxStudents: parseInt(e.target.value) || 30,
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(index)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddTag())
                }
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" /> Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Prerequisites */}
        <Card>
          <CardHeader>
            <CardTitle>Prerequisites</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.prerequisites.map((prereq, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input value={prereq} readOnly className="flex-1 bg-muted" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemovePrerequisite(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                placeholder="Add a prerequisite..."
                value={newPrerequisite}
                onChange={(e) => setNewPrerequisite(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  (e.preventDefault(), handleAddPrerequisite())
                }
              />
              <Button
                type="button"
                onClick={handleAddPrerequisite}
                variant="outline"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Objectives */}
        <Card>
          <CardHeader>
            <CardTitle>Learning Objectives *</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.objectives.map((objective, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input value={objective} readOnly className="flex-1 bg-muted" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveObjective(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                placeholder="Add a learning objective..."
                value={newObjective}
                onChange={(e) => setNewObjective(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  (e.preventDefault(), handleAddObjective())
                }
              />
              <Button type="button" onClick={handleAddObjective}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Modules */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Program Modules *</CardTitle>
            <Button variant="outline" size="sm" onClick={handleAddModule}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Module
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.modules.map((module, index) => (
              <Card key={index} className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <Input
                        value={module.title}
                        onChange={(e) =>
                          handleUpdateModule(index, { title: e.target.value })
                        }
                        placeholder={`Week ${index + 1}: Module Title`}
                        className="font-semibold"
                      />
                      <Textarea
                        value={module.description}
                        onChange={(e) =>
                          handleUpdateModule(index, {
                            description: e.target.value,
                          })
                        }
                        placeholder="Module description..."
                        rows={2}
                      />
                    </div>
                    {formData.modules.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveModule(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Co-Coaches */}
        <Card>
          <CardHeader>
            <CardTitle>Co-Coaches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <Switch
                id="multi-coach"
                checked={formData.isMultiCoach}
                onCheckedChange={(checked) =>
                  updateFormData({ isMultiCoach: checked })
                }
              />
              <Label htmlFor="multi-coach">
                This program will be co-delivered with other Nebula coaches.
              </Label>
            </div>

            {formData.isMultiCoach && (
              <div className="space-y-4">
                {formData.coCoaches.map((coach) => (
                  <div
                    key={coach.id}
                    className="flex items-center justify-between p-2 bg-muted rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={coach.avatar} />
                        <AvatarFallback>
                          {coach.name?.charAt(0) || "C"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{coach.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCoCoach(coach.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <UserSelect
                  onChange={(coach: any) => {
                    if (coach) {
                      handleAddCoCoach({
                        id: coach.id,
                        name: coach.name,
                        avatar: coach.avatar,
                      });
                    }
                  }}
                  placeholder="Select Coach"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" asChild>
            <Link href="/coach-dashboard/programs">Cancel</Link>
          </Button>
          <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
