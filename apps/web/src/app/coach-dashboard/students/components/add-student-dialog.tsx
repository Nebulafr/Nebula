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
import { useTranslations } from "next-intl";

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programs: string[];
  onAddStudent: (studentData: StudentFormData) => void;
  loading?: boolean;
}

export interface StudentFormData {
  name: string;
  email: string;
  program: string;
  notes?: string;
}

export function AddStudentDialog({
  open,
  onOpenChange,
  programs,
  onAddStudent,
  loading = false,
}: AddStudentDialogProps) {
  const t = useTranslations("dashboard.coach.students.addDialog");
  const commonT = useTranslations("common");
  
  const [formData, setFormData] = useState<StudentFormData>({
    name: "",
    email: "",
    program: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Partial<StudentFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<StudentFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.program) {
      newErrors.program = "Program is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onAddStudent(formData);
      // Reset form
      setFormData({ name: "", email: "", program: "", notes: "" });
      setErrors({});
    }
  };

  const handleInputChange = (field: keyof StudentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>
              {t("description")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{commonT("fullName")} *</Label>
              <Input
                id="name"
                placeholder={t("emailPlaceholder").replace("student@example.com", "John Doe")} // Need better placeholder key
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("email")} *</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("emailPlaceholder")}
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="program">{t("program")} *</Label>
              <Select
                value={formData.program}
                onValueChange={(value) => handleInputChange("program", value)}
              >
                <SelectTrigger className={errors.program ? "border-red-500" : ""}>
                  <SelectValue placeholder={t("program")} />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((program) => (
                    <SelectItem key={program} value={program}>
                      {program}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.program && (
                <p className="text-sm text-red-500">{errors.program}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes ({commonT("optional") || "Optional"})</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t("inviting") : t("invite")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}