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
import { ExperienceLevel, UserRole } from "@/generated/prisma";
import { useCategories } from "@/hooks";
import { UserSelect } from "@/components/ui/user-select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPut } from "@/lib/utils";
import { toast } from "react-toastify";
import { handleAndToastError } from "@/lib/error-handler";
import { useTranslations } from "next-intl";

interface ProgramModule {
  id?: string;
  title: string;
  week: number;
  description: string;
  materials: any[];
}

interface CoCoach {
  id: string;
  name: string;
  avatar?: string;
}

export default function EditProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations("dashboard.coach.programs.edit");
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
    targetAudience: ExperienceLevel[];
    objectives: string[];
    modules: ProgramModule[];
    price: number;
    duration: number;
    difficultyLevel: ExperienceLevel;
    maxStudents: number;
    tags: string[];
    prerequisites: string[];
    isMultiCoach: boolean;
    coCoaches: CoCoach[];
  }>({
    title: "",
    description: "",
    category: "",
    targetAudience: [],
    objectives: [],
    modules: [],
    price: 0,
    duration: 3,
    difficultyLevel: ExperienceLevel.BEGINNER,
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
        targetAudience: (program.targetAudience as ExperienceLevel[]) || [],
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
        difficultyLevel: program.difficultyLevel || ExperienceLevel.BEGINNER,
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
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      queryClient.invalidateQueries({ queryKey: ["program", id] });
      router.push("/coach-dashboard/programs");
    },
    onError: (error: any) => {
      handleAndToastError(error, t("updateError"));
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
          title: t("modulePlaceholder", { count: formData.modules.length + 1 }),
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
      toast.error(t("titleRequired"));
      return;
    }
    if (!formData.description.trim()) {
      toast.error(t("descriptionRequired"));
      return;
    }
    if (!formData.category) {
      toast.error(t("categoryRequired"));
      return;
    }
    if (formData.objectives.length === 0) {
      toast.error(t("objectivesRequired"));
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
          <span>{t("loading")}</span>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("notFound")}</p>
          <Button asChild className="mt-4">
            <Link href="/coach-dashboard/programs">{t("backToPrograms")}</Link>
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
            <h1 className="text-2xl font-bold">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{program.title}</p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {t("saveChanges")}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t("basicInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t("programTitle")}</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                placeholder={t("programTitlePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t("description")}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  updateFormData({ description: e.target.value })
                }
                placeholder={t("descriptionPlaceholder")}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("category")}</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => updateFormData({ category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectCategory")} />
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
            <div className="space-y-4">
              <Label>{t("targetAudience")}</Label>
              <div className="flex flex-wrap gap-4">
                {[
                  { value: ExperienceLevel.BEGINNER, label: t("difficultyBeginner") },
                  { value: ExperienceLevel.INTERMEDIATE, label: t("difficultyIntermediate") },
                  { value: ExperienceLevel.ADVANCED, label: t("difficultyAdvanced") },
                ].map((level) => (
                  <label
                    key={level.value}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-muted-foreground/10 hover:border-primary/50 cursor-pointer transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={formData.targetAudience.includes(level.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFormData({
                            targetAudience: [...formData.targetAudience, level.value],
                          });
                        } else {
                          updateFormData({
                            targetAudience: formData.targetAudience.filter(
                              (l) => l !== level.value
                            ),
                          });
                        }
                      }}
                    />
                    <span className="text-sm font-medium">{level.label}</span>
                  </label>
                ))}
              </div>
            </div>
            </div>
          </CardContent>
        </Card>

        {/* Program Settings */}
        <Card>
          <CardHeader>
            <CardTitle>{t("settings")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">{t("price")}</Label>
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
                <Label htmlFor="duration">{t("duration")}</Label>
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
                <Label>{t("difficulty")}</Label>
                <Select
                  value={formData.difficultyLevel}
                  onValueChange={(value) =>
                    updateFormData({
                      difficultyLevel: value as ExperienceLevel,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      {
                        value: ExperienceLevel.BEGINNER,
                        label: t("difficultyBeginner"),
                      },
                      {
                        value: ExperienceLevel.INTERMEDIATE,
                        label: t("difficultyIntermediate"),
                      },
                      {
                        value: ExperienceLevel.ADVANCED,
                        label: t("difficultyAdvanced"),
                      },
                    ].map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxStudents">{t("maxStudents")}</Label>
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
            <CardTitle>{t("tags")}</CardTitle>
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
                placeholder={t("addTag")}
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddTag())
                }
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" /> {t("add")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Prerequisites */}
        <Card>
          <CardHeader>
            <CardTitle>{t("prerequisites")}</CardTitle>
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
                placeholder={t("addPrerequisite")}
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
                <PlusCircle className="mr-2 h-4 w-4" /> {t("add")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Objectives */}
        <Card>
          <CardHeader>
            <CardTitle>{t("learningObjectives")}</CardTitle>
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
                placeholder={t("addObjective")}
                value={newObjective}
                onChange={(e) => setNewObjective(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  (e.preventDefault(), handleAddObjective())
                }
              />
              <Button type="button" onClick={handleAddObjective}>
                <PlusCircle className="mr-2 h-4 w-4" /> {t("add")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Modules */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("modules")}</CardTitle>
            <Button variant="outline" size="sm" onClick={handleAddModule}>
              <PlusCircle className="mr-2 h-4 w-4" /> {t("addModule")}
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
                        placeholder={t("modulePlaceholder", { count: index + 1 })}
                        className="font-semibold"
                      />
                      <Textarea
                        value={module.description}
                        onChange={(e) =>
                          handleUpdateModule(index, {
                            description: e.target.value,
                          })
                        }
                        placeholder={t("moduleDescriptionPlaceholder")}
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
            <CardTitle>{t("coCoaches")}</CardTitle>
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
                {t("isMultiCoach")}
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
                  role={UserRole.COACH}
                  placeholder={t("selectCoach")}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" asChild>
            <Link href="/coach-dashboard/programs">{t("cancel")}</Link>
          </Button>
          <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {t("saveChanges")}
          </Button>
        </div>
      </div>
    </div>
  );
}
