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
import { useProposeProgramContext } from "../context/propose-program-context";
import { DifficultyLevel } from "@/generated/prisma";
import { Badge } from "@/components/ui/badge";
import { useCategories } from "@/hooks";

const DIFFICULTY_OPTIONS = [
  { value: DifficultyLevel.BEGINNER, label: "Beginner" },
  { value: DifficultyLevel.INTERMEDIATE, label: "Intermediate" },
  { value: DifficultyLevel.ADVANCED, label: "Advanced" },
];

export default function ProposeStep2Page() {
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

  return (
    <Card className="w-full max-w-4xl shadow-lg">
      <CardContent className="p-8">
        <Stepper currentStep={2} />
        <div className="mt-12">
          <h1 className="text-3xl font-bold">Program Details</h1>
          <p className="mt-2 text-muted-foreground">
            Structure your program, define modules, and specify who will be
            coaching.
          </p>
        </div>
        <div className="grid gap-8 mt-8">
          {/* Basic Info */}
          <div className="space-y-2">
            <Label htmlFor="program-title">Program Title *</Label>
            <Input
              id="program-title"
              placeholder="e.g., Breaking into Product Management"
              value={formData.title}
              onChange={(e) => updateFormData({ title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="program-description">Program Description *</Label>
            <Textarea
              id="program-description"
              placeholder="Provide a short, compelling description of your program..."
              rows={3}
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
            />
          </div>

          {/* Category & Target Audience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="career-track">Career Track *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => updateFormData({ category: value })}
              >
                <SelectTrigger id="career-track">
                  <SelectValue placeholder="Select track" />
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
              <Label htmlFor="target-audience">Target Audience</Label>
              <Input
                id="target-audience"
                placeholder="e.g., Aspiring PMs with 0-2 years experience"
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
              <Label htmlFor="price">Price ($)</Label>
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
              <Label htmlFor="duration">Duration (In Weeks)</Label>
              <Input
                id="duration"
                placeholder="e.g., 3 weeks"
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  updateFormData({ duration: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select
                value={formData.difficultyLevel}
                onValueChange={(value) =>
                  updateFormData({ difficultyLevel: value as DifficultyLevel })
                }
              >
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select level" />
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
              <Label htmlFor="max-students">Max Students</Label>
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
            <Label>Tags</Label>
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
          </div>

          {/* Prerequisites */}
          <div className="space-y-2">
            <Label>Prerequisites</Label>
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
          </div>

          {/* Program Objectives */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Program Objectives *</h3>
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
                  placeholder="Add a learning objective..."
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), handleAddObjective())
                  }
                />
                <Button onClick={handleAddObjective}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add
                </Button>
              </div>
            </div>
          </div>

          {/* Program Modules */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Program Modules *</h3>
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
                        placeholder={`Week ${index + 1}: Module Title`}
                        className="font-semibold bg-transparent border-0 focus-visible:ring-1"
                      />
                      <Textarea
                        value={module.description}
                        onChange={(e) =>
                          updateModule(index, { description: e.target.value })
                        }
                        placeholder="Module description..."
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
              <PlusCircle className="mr-2 h-4 w-4" /> Add Module
            </Button>
          </div>

          {/* Coaches */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Coaches</h3>
            <div className="flex items-center space-x-2 mb-4 p-4 border rounded-lg">
              <Switch
                id="multi-coach-toggle"
                checked={formData.isMultiCoach}
                onCheckedChange={(checked) =>
                  updateFormData({ isMultiCoach: checked })
                }
              />
              <Label htmlFor="multi-coach-toggle">
                This program will be co-delivered with other Nebula coaches.
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
                          <AvatarImage src={coach.avatar} />
                          <AvatarFallback>
                            {coach.name.charAt(0)}
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
                  <Button variant="outline" className="w-full">
                    <UserPlus className="mr-2 h-4 w-4" /> Add Coach from Nebula
                    Platform
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>

        <div className="flex justify-between mt-12">
          <Button asChild size="lg" variant="outline">
            <Link href="/coach-dashboard/programs/propose/step-1">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Link>
          </Button>
          <Button asChild size="lg" disabled={!isStep2Valid}>
            <Link
              href={
                isStep2Valid ? "/coach-dashboard/programs/propose/step-3" : "#"
              }
            >
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
