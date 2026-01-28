"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

interface TagInputFieldProps {
  label: string;
  description?: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  protectedTags?: string[];
}

export function TagInputField({
  label,
  description,
  tags,
  onTagsChange,
  placeholder = "Add...",
  protectedTags = [],
}: TagInputFieldProps) {
  const t = useTranslations("dashboard.coach.programs.proposeFlow.step2"); // Borrowing placeholder logic or use settings.profile
  const [inputValue, setInputValue] = useState("");

  const addTag = () => {
    if (inputValue.trim() && !tags.includes(inputValue.trim())) {
      onTagsChange([...tags, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    if (protectedTags.includes(tagToRemove)) return;
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {description && (
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {tag}
            {!protectedTags.includes(tag) && (
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeTag(tag)}
              />
            )}
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          onKeyPress={handleKeyPress}
        />
        <Button
          type="button"
          onClick={addTag}
          size="sm"
          className="shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("add")}
        </Button>
      </div>
    </div>
  );
}