"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import ModulesForm from "@/components/ModuleForm";
import { ModuleFormData } from "@/types";

interface CreateProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
  onCreateProgram: (programData: ProgramFormData) => Promise<boolean>;
  loading?: boolean;
}

export interface ProgramFormData {
  title: string;
  description: string;
  category: string;
  difficultyLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  duration: string;
  price: number;
  maxStudents: number;
  tags: string[];
  objectives: string[];
  modules: ModuleFormData[];
}

export function CreateProgramDialog({
  open,
  onOpenChange,
  categories,
  onCreateProgram,
  loading = false,
}: CreateProgramDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProgramFormData>({
    title: "",
    description: "",
    category: "",
    difficultyLevel: "BEGINNER",
    duration: "",
    price: 0,
    maxStudents: 0,
    tags: [],
    objectives: [],
    modules: [],
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof ProgramFormData, string>>
  >({});
  const [tagInput, setTagInput] = useState("");
  const [objectiveInput, setObjectiveInput] = useState("");

  const validateStep1 = (): boolean => {
    const newErrors: Partial<Record<keyof ProgramFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Partial<Record<keyof ProgramFormData, string>> = {};

    if (!formData.duration.trim()) {
      newErrors.duration = "Duration is required";
    }

    if (formData.price < 0) {
      newErrors.price = "Price must be 0 or greater";
    }

    if (formData.maxStudents > 0 && formData.maxStudents < 1) {
      newErrors.maxStudents = "Max students must be at least 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Partial<Record<keyof ProgramFormData, string>> = {};

    if (formData.modules.length === 0) {
      newErrors.modules = "At least one module is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    }
    setErrors({});
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addObjective = () => {
    if (
      objectiveInput.trim() &&
      !formData.objectives.includes(objectiveInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        objectives: [...prev.objectives, objectiveInput.trim()],
      }));
      setObjectiveInput("");
    }
  };

  const removeObjective = (objToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives.filter((obj) => obj !== objToRemove),
    }));
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      title: "",
      description: "",
      category: "",
      difficultyLevel: "BEGINNER",
      duration: "",
      price: 0,
      maxStudents: 0,
      tags: [],
      objectives: [],
      modules: [],
    });
    setTagInput("");
    setObjectiveInput("");
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateStep3()) {
      const success = await onCreateProgram(formData);
      if (success) {
        resetForm();
        onOpenChange(false);
      }
    }
  };

  const handleInputChange = (field: keyof ProgramFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
            1
          </div>
          <span className="font-medium">Basic Information</span>
        </div>
        <div className="w-8 h-[1px] bg-muted"></div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs">
            2
          </div>
          <span>Details & Settings</span>
        </div>
        <div className="w-8 h-[1px] bg-muted"></div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs">
            3
          </div>
          <span>Modules</span>
        </div>
      </div>

      {/* Program Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-base font-medium">
          Program Title *
        </Label>
        <Input
          id="title"
          placeholder="e.g., JavaScript Fundamentals for Beginners"
          value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          className={`h-11 ${errors.title ? "border-red-500" : ""}`}
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
      </div>

      {/* Program Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-base font-medium">
          Program Description *
        </Label>
        <Textarea
          id="description"
          placeholder="Describe what students will learn, what outcomes they can expect, and what makes this program unique..."
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          className={`min-h-[100px] resize-none ${
            errors.description ? "border-red-500" : ""
          }`}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      {/* Category and Difficulty Level */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="category" className="text-base font-medium">
            Category *
          </Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleInputChange("category", value)}
          >
            <SelectTrigger
              className={`h-11 ${errors.category ? "border-red-500" : ""}`}
            >
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-red-500">{errors.category}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty" className="text-base font-medium">
            Difficulty Level
          </Label>
          <Select
            value={formData.difficultyLevel}
            onValueChange={(value: any) =>
              handleInputChange("difficultyLevel", value)
            }
          >
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BEGINNER">Beginner</SelectItem>
              <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
              <SelectItem value="ADVANCED">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs">
            1
          </div>
          <span>Basic Information</span>
        </div>
        <div className="w-8 h-[1px] bg-muted"></div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
            2
          </div>
          <span className="font-medium">Details & Settings</span>
        </div>
        <div className="w-8 h-[1px] bg-muted"></div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs">
            3
          </div>
          <span>Modules</span>
        </div>
      </div>

      {/* Duration, Price, Max Students */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration" className="text-base font-medium">
            Duration *
          </Label>
          <Input
            id="duration"
            placeholder="e.g., 8 weeks"
            value={formData.duration}
            onChange={(e) => handleInputChange("duration", e.target.value)}
            className={`h-11 ${errors.duration ? "border-red-500" : ""}`}
          />
          {errors.duration && (
            <p className="text-sm text-red-500">{errors.duration}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price" className="text-base font-medium">
            Price ($) *
          </Label>
          <Input
            id="price"
            type="number"
            min="0"
            placeholder="0"
            value={formData.price || ""}
            onChange={(e) =>
              handleInputChange("price", parseInt(e.target.value) || 0)
            }
            className={`h-11 ${errors.price ? "border-red-500" : ""}`}
          />
          {errors.price && (
            <p className="text-sm text-red-500">{errors.price}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxStudents" className="text-base font-medium">
            Max Students
          </Label>
          <Input
            id="maxStudents"
            type="number"
            min="1"
            placeholder="Unlimited"
            value={
              formData.maxStudents === 0
                ? ""
                : formData.maxStudents?.toString() || ""
            }
            onChange={(e) =>
              handleInputChange(
                "maxStudents",
                e.target.value ? parseInt(e.target.value) : 0
              )
            }
            className={`h-11 ${errors.maxStudents ? "border-red-500" : ""}`}
          />
          {errors.maxStudents && (
            <p className="text-sm text-red-500">{errors.maxStudents}</p>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Tags</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add a tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), addTag())
            }
            className="h-11"
          />
          <Button
            type="button"
            onClick={addTag}
            variant="outline"
            className="h-11 px-4"
          >
            Add
          </Button>
        </div>
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-sm py-1 px-3"
              >
                {tag}
                <X
                  className="w-3 h-3 ml-1 cursor-pointer hover:text-destructive"
                  onClick={() => removeTag(tag)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Learning Objectives */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Learning Objectives</Label>
          <Button
            type="button"
            onClick={() => {
              if (objectiveInput.trim()) {
                addObjective();
              } else {
                // Focus the input if it's empty
                const input = document.querySelector(
                  'input[placeholder="What will students learn?"]'
                ) as HTMLInputElement;
                input?.focus();
              }
            }}
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs"
          >
            + Add
          </Button>
        </div>

        <Input
          placeholder="What will students learn?"
          value={objectiveInput}
          onChange={(e) => setObjectiveInput(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && (e.preventDefault(), addObjective())
          }
          className="h-11"
        />

        {formData.objectives.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              {formData.objectives.length} objective
              {formData.objectives.length !== 1 ? "s" : ""} added
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <ul className="space-y-3">
                {formData.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-3 group">
                    <div className="flex items-center justify-center w-6 h-6 bg-primary/10 text-primary rounded-full text-xs font-medium mt-0.5 flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-sm flex-1 leading-relaxed">
                      {objective}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeObjective(objective)}
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs">
            1
          </div>
          <span>Basic Information</span>
        </div>
        <div className="w-8 h-[1px] bg-muted"></div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs">
            2
          </div>
          <span>Details & Settings</span>
        </div>
        <div className="w-8 h-[1px] bg-muted"></div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
            3
          </div>
          <span className="font-medium">Modules</span>
        </div>
      </div>

      {/* Modules Form */}
      <div>
        <Label className="text-base font-medium mb-4 block">
          Program Modules *
        </Label>
        <p className="text-sm text-muted-foreground mb-6">
          Add modules to organize your program content by weeks or topics. At
          least one module is required.
        </p>
        <div
          className={
            errors.modules ? "border border-red-500 rounded-lg p-4" : ""
          }
        >
          <ModulesForm
            value={formData.modules}
            onChange={(modules) => handleInputChange("modules", modules)}
          />
        </div>
        {errors.modules && (
          <p className="text-sm text-red-500 mt-2">{errors.modules}</p>
        )}
      </div>
    </div>
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(openState) => {
        if (!openState) {
          resetForm();
        }
        onOpenChange(openState);
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-xl">Create New Program</DialogTitle>
          <DialogDescription className="text-base">
            Set up a new coaching program for your students. Fill in the details
            step by step.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={currentStep === 3 ? handleSubmit : undefined}
          className="space-y-6"
        >
          {currentStep === 1
            ? renderStep1()
            : currentStep === 2
            ? renderStep2()
            : renderStep3()}

          <DialogFooter className="pt-6 gap-2">
            {currentStep === 1 ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={handleNext}>
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </>
            ) : currentStep === 2 ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={loading}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button type="button" onClick={handleNext}>
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={loading}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Program"}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
