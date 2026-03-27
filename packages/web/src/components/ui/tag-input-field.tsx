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
  options?: { id: string; name: string }[];
}

export function TagInputField({
  label,
  description,
  tags,
  onTagsChange,
  placeholder = "Add...",
  protectedTags = [],
  options,
}: TagInputFieldProps) {
  const t = useTranslations("dashboard.coach.programs.proposeFlow.step2");
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addTag = (tagToAdd: string) => {
    const trimmedTag = tagToAdd.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onTagsChange([...tags, trimmedTag]);
      setInputValue("");
    }
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    if (protectedTags.includes(tagToRemove)) return;
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!options) {
        addTag(inputValue);
      }
    }
  };

  const filteredOptions = options?.filter(
    (opt) =>
      opt.name.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(opt.id)
  );

  const getTagDisplay = (tag: string) => {
    if (options) {
      const option = options.find((opt) => opt.id === tag);
      return option ? option.name : tag;
    }
    return tag;
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
            {getTagDisplay(tag)}
            {!protectedTags.includes(tag) && (
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeTag(tag)}
              />
            )}
          </Badge>
        ))}
      </div>
      <div className="relative">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            onKeyPress={handleKeyPress}
          />
          {!options && (
            <Button
              type="button"
              onClick={() => addTag(inputValue)}
              size="sm"
              className="shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("add")}
            </Button>
          )}
        </div>

        {showSuggestions && options && filteredOptions && filteredOptions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
            {filteredOptions.map((opt) => (
              <div
                key={opt.id}
                className="px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground text-sm"
                onClick={() => addTag(opt.id)}
              >
                {opt.name}
              </div>
            ))}
          </div>
        )}
      </div>
      {showSuggestions && options && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowSuggestions(false)} 
        />
      )}
    </div>
  );
}