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

interface CreateProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
  onCreateProgram: (programData: ProgramFormData) => void;
  loading?: boolean;
}

export interface ProgramFormData {
  title: string;
  description: string;
  category: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  price: number;
  maxStudents?: number;
  tags: string[];
  objectives: string[];
}

export function CreateProgramDialog({
  open,
  onOpenChange,
  categories,
  onCreateProgram,
  loading = false,
}: CreateProgramDialogProps) {
  const [formData, setFormData] = useState<ProgramFormData>({
    title: "",
    description: "",
    category: "",
    difficultyLevel: "beginner",
    duration: "",
    price: 0,
    maxStudents: undefined,
    tags: [],
    objectives: [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProgramFormData, string>>>({});
  const [tagsInput, setTagsInput] = useState("");
  const [objectivesInput, setObjectivesInput] = useState("");

  const validateForm = (): boolean => {
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

    if (!formData.duration.trim()) {
      newErrors.duration = "Duration is required";
    }

    if (formData.price < 0) {
      newErrors.price = "Price must be 0 or greater";
    }

    if (formData.maxStudents && formData.maxStudents < 1) {
      newErrors.maxStudents = "Max students must be at least 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Process tags and objectives
    const processedData = {
      ...formData,
      tags: tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      objectives: objectivesInput.split('\n').map(obj => obj.trim()).filter(obj => obj.length > 0),
    };

    if (validateForm()) {
      onCreateProgram(processedData);
      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        difficultyLevel: "beginner",
        duration: "",
        price: 0,
        maxStudents: undefined,
        tags: [],
        objectives: [],
      });
      setTagsInput("");
      setObjectivesInput("");
      setErrors({});
    }
  };

  const handleInputChange = (field: keyof ProgramFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Program</DialogTitle>
            <DialogDescription>
              Create a new coaching program for your students. You can edit these details later.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Program Title *</Label>
              <Input
                id="title"
                placeholder="Enter program title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what students will learn..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className={errors.description ? "border-red-500" : ""}
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Category and Difficulty */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange("category", value)}
                >
                  <SelectTrigger className={errors.category ? "border-red-500" : ""}>
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
                <Label htmlFor="difficulty">Difficulty Level *</Label>
                <Select
                  value={formData.difficultyLevel}
                  onValueChange={(value: any) => handleInputChange("difficultyLevel", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Duration, Price, Max Students */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration *</Label>
                <Input
                  id="duration"
                  placeholder="e.g., 8 weeks"
                  value={formData.duration}
                  onChange={(e) => handleInputChange("duration", e.target.value)}
                  className={errors.duration ? "border-red-500" : ""}
                />
                {errors.duration && (
                  <p className="text-sm text-red-500">{errors.duration}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.price || ""}
                  onChange={(e) => handleInputChange("price", parseInt(e.target.value) || 0)}
                  className={errors.price ? "border-red-500" : ""}
                />
                {errors.price && (
                  <p className="text-sm text-red-500">{errors.price}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxStudents">Max Students</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  value={formData.maxStudents || ""}
                  onChange={(e) => handleInputChange("maxStudents", e.target.value ? parseInt(e.target.value) : undefined)}
                  className={errors.maxStudents ? "border-red-500" : ""}
                />
                {errors.maxStudents && (
                  <p className="text-sm text-red-500">{errors.maxStudents}</p>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="Enter tags separated by commas"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Separate multiple tags with commas (e.g., JavaScript, React, Frontend)
              </p>
            </div>

            {/* Learning Objectives */}
            <div className="space-y-2">
              <Label htmlFor="objectives">Learning Objectives</Label>
              <Textarea
                id="objectives"
                placeholder="Enter each objective on a new line"
                value={objectivesInput}
                onChange={(e) => setObjectivesInput(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Enter each learning objective on a separate line
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Program"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}