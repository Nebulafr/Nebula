/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatUserName, getUserInitials } from "@/lib/chat-utils";
import { AdminProgram } from "@/types/program";
import { useTranslations } from "next-intl";

interface Category {
  id?: string;
  name: string;
}

interface ProgramDetailsDialogProps {
  program: AdminProgram | null;
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onReassignCategory?: (programId: string, categoryName: string) => void;
  loading?: boolean;
}

export function ProgramDetailsDialog({
  program,
  isOpen,
  onClose,
  categories,
  onReassignCategory,
  loading = false,
}: ProgramDetailsDialogProps) {
  const t = useTranslations("dashboard.admin");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    if (program) {
      setSelectedCategory(program.category.name);
    }
  }, [program]);

  const handleReassign = () => {
    if (program && selectedCategory !== program.category.name) {
      onReassignCategory?.(program.id, selectedCategory);
      onClose();
    }
  };

  if (!program) return null;

  const coachName = formatUserName(program.coach.user.fullName || "Unknown");
  const coachInitials = getUserInitials(
    program.coach.user.fullName || "Unknown"
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{program.title}</DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-2 mt-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={program.coach.user.avatarUrl} />
                <AvatarFallback>{coachInitials}</AvatarFallback>
              </Avatar>
              <span>{coachName}</span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="program-description" className="text-right pt-2">
              {t("description")}
            </Label>
            <p
              id="program-description"
              className="col-span-3 text-sm text-muted-foreground bg-muted p-3 rounded-md"
            >
              {program.description}
            </p>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="program-category" className="text-right">
              {t("category")}
            </Label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              disabled={loading}
            >
              <SelectTrigger id="program-category" className="col-span-3">
                <SelectValue placeholder={t("selectCategory")} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.name} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("close")}
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleReassign}
            disabled={loading || selectedCategory === program.category.name}
          >
            {loading ? t("updating") : t("reassignCategory")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

