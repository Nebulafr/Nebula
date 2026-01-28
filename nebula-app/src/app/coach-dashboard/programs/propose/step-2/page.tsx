"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  ArrowLeft,
  ArrowRight,
  PlusCircle,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Stepper } from "../components/stepper";
import {
  CoCoach,
  useProposeProgramContext,
} from "../context/propose-program-context";
import { DifficultyLevel } from "@/generated/prisma";
import { Badge } from "@/components/ui/badge";
import { useCategories } from "@/hooks";
import { UserSelect } from "@/components/ui/user-select";
import { useTranslations } from "next-intl";

const DIFFICULTY_OPTIONS = (t: any) => [
  { value: DifficultyLevel.BEGINNER, label: t("difficultyBeginner") },
  { value: DifficultyLevel.INTERMEDIATE, label: t("difficultyIntermediate") },
  { value: DifficultyLevel.ADVANCED, label: t("difficultyAdvanced") },
];

export default function ProposeStep2Page() {
  const t = useTranslations("dashboard.coach.programs.proposeFlow.step2");
  const { data: categoriesResponse } = useCategories();
  console.log({ data: categoriesResponse });
  const {
    formData,
    updateFormData,
    addObjective,
    removeObjective,
    addModule,
    updateModule,
    removeModule,
    addTag,
    removeTag,
    addPrerequisite,
    removePrerequisite,
    removeCoCoach,
    isStep2Valid,
    addCoCoach,
  } = useProposeProgramContext();

  const [newObjective, setNewObjective] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newPrerequisite, setNewPrerequisite] = useState("");
  const categories = (categoriesResponse as any)?.data.categories || [];

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      addObjective(newObjective);
      setNewObjective("");
    }
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      addTag(newTag);
      setNewTag("");
    }
  };

  const handleAddPrerequisite = () => {
    if (newPrerequisite.trim()) {
      addPrerequisite(newPrerequisite);
      setNewPrerequisite("");
    }
  };

  const handleSelectCoCoach = (coach: CoCoach) => {
    if (coach) {
      addCoCoach(coach);
    }
  };

  return (
    <Card className="w-full max-w-4xl shadow-lg">
      <CardContent className="p-8">
        <Stepper currentStep={2} />
        <div className="mt-12">
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="mt-2 text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <div className="grid gap-8 mt-8">
          {/* Basic Info */}
          <div className="space-y-2">
            <Label htmlFor="program-title">{t("programTitle")}</Label>
            <Input
              id="program-title"
              placeholder={t("programTitlePlaceholder")}
              value={formData.title}
              onChange={(e) => updateFormData({ title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="program-description">{t("programDescription")}</Label>
            <Textarea
              id="program-description"
              placeholder={t("programDescriptionPlaceholder")}
              rows={3}
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
            />
          </div>

          {/* Category & Target Audience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="career-track">{t("careerTrack")}</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => updateFormData({ category: value })}
              >
                <SelectTrigger id="career-track">
                  <SelectValue placeholder={t("careerTrackPlaceholder")} />
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
              <Label htmlFor="target-audience">{t("targetAudience")}</Label>
              <Input
                id="target-audience"
                placeholder={t("targetAudiencePlaceholder")}
                value={formData.targetAudience}
                onChange={(e) =>
                  updateFormData({ targetAudience: e.target.value })
                }
              />
            </div>
          </div>

          {/* Price, Duration, Difficulty, Max Students */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price">{t("price")}</Label>
              <Input
                id="price"
                type="number"
                min={0}
                placeholder="0"
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
                placeholder={t("durationPlaceholder")}
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  updateFormData({ duration: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">{t("difficulty")}</Label>
              <Select
                value={formData.difficultyLevel}
                onValueChange={(value) =>
                  updateFormData({ difficultyLevel: value as DifficultyLevel })
                }
              >
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder={t("difficultyPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_OPTIONS(t).map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-students">{t("maxStudents")}</Label>
              <Input
                id="max-students"
                type="number"
                min={1}
                placeholder="30"
                value={formData.maxStudents || ""}
                onChange={(e) =>
                  updateFormData({
                    maxStudents: parseInt(e.target.value) || 30,
                  })
                }
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>{t("tags")}</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2">
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
          </div>

          {/* Prerequisites */}
          <div className="space-y-2">
            <Label>{t("prerequisites")}</Label>
            <div className="space-y-2 mb-2">
              {formData.prerequisites.map((prereq, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={prereq} readOnly className="flex-1 bg-muted" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePrerequisite(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder={t("addPrereq")}
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
          </div>

          {/* Program Objectives */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("objectives")}</h3>
            <div className="space-y-4">
              <div className="space-y-3">
                {formData.objectives.map((objective, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={objective}
                      readOnly
                      className="flex-1 bg-muted"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeObjective(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder={t("addObjective")}
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), handleAddObjective())
                  }
                />
                <Button onClick={handleAddObjective}>
                  <PlusCircle className="mr-2 h-4 w-4" /> {t("add")}
                </Button>
              </div>
            </div>
          </div>

          {/* Program Modules */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("modules")}</h3>
            <div className="space-y-4">
              {formData.modules.map((module, index) => (
                <Card key={index} className="bg-muted/50 p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <Input
                        value={module.title}
                        onChange={(e) =>
                          updateModule(index, { title: e.target.value })
                        }
                        placeholder={t("modulePlaceholder", { index: index + 1 })}
                        className="font-semibold bg-transparent border-0 focus-visible:ring-1"
                      />
                      <Textarea
                        value={module.description}
                        onChange={(e) =>
                          updateModule(index, { description: e.target.value })
                        }
                        placeholder={t("moduleDescriptionPlaceholder")}
                        rows={2}
                        className="text-sm bg-transparent border-0 focus-visible:ring-1"
                      />
                    </div>
                    {formData.modules.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeModule(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
            <Button variant="outline" className="mt-4" onClick={addModule}>
              <PlusCircle className="mr-2 h-4 w-4" /> {t("addModule")}
            </Button>
          </div>

          {/* Coaches */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("coCoaches")}</h3>
            <div className="flex items-center space-x-2 mb-4 p-4 border rounded-lg">
              <Switch
                id="multi-coach-toggle"
                checked={formData.isMultiCoach}
                onCheckedChange={(checked) =>
                  updateFormData({ isMultiCoach: checked })
                }
              />
              <Label htmlFor="multi-coach-toggle">
                {t("multiCoachLabel")}
              </Label>
            </div>

            {formData.isMultiCoach && (
              <Card className="bg-muted/50 p-4">
                <div className="space-y-4">
                  {formData.coCoaches.map((coach) => (
                    <div
                      key={coach.id}
                      className="flex items-center justify-between bg-background p-2 rounded-md"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={coach?.avatar} />
                          <AvatarFallback>
                            {coach?.name?.charAt(0) || "C"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{coach.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCoCoach(coach.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}

                  <UserSelect
                    onChange={(coach: any) => {
                      if (coach) {
                        const isAlreadyAdded = formData.coCoaches.some(
                          (existingCoach) => existingCoach.id === coach.id
                        );

                        if (!isAlreadyAdded) {
                          handleSelectCoCoach(coach);
                        }
                      }
                    }}
                    placeholder={t("selectCoach")}
                  />
                </div>
              </Card>
            )}
          </div>
        </div>

        <div className="flex justify-between mt-12">
          <Button asChild size="lg" variant="outline">
            <Link href="/coach-dashboard/programs/propose/step-1">
              <ArrowLeft className="mr-2 h-4 w-4" /> {t("back")}
            </Link>
          </Button>
          <Button asChild size="lg" disabled={!isStep2Valid}>
            <Link
              href={
                isStep2Valid ? "/coach-dashboard/programs/propose/step-3" : "#"
              }
            >
              {t("next")} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
