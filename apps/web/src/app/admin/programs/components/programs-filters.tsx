"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Search, ChevronDown, Plus, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface Category {
  id?: string;
  name: string;
}

interface ProgramsFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  categories: Category[];
  onAddCategory?: (name: string) => void;
  onDeleteCategory?: (name: string) => void;
  loading?: boolean;
}

export function ProgramsFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  categories,
  onAddCategory,
  onDeleteCategory,
  loading = false,
}: ProgramsFiltersProps) {
  const t = useTranslations("dashboard.admin");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const handleAddCategory = () => {
    if (
      newCategory.trim() &&
      !categories.some((cat) => cat.name === newCategory.trim())
    ) {
      onAddCategory?.(newCategory.trim());
      setNewCategory("");
      setIsAddingCategory(false);
    }
  };

  const handleCategorySelect = (categoryName: string) => {
    onCategoryFilterChange(categoryName === "All" ? "all" : categoryName);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-between">
        <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="flex items-center gap-2">
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t("searchPrograms")}
          className="pl-9"
          value={searchTerm || ""}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2">
        <Tabs value={statusFilter} onValueChange={onStatusFilterChange}>
          <TabsList>
            <TabsTrigger value="all">{t("all")}</TabsTrigger>
            <TabsTrigger value="active">{t("active")}</TabsTrigger>
            <TabsTrigger value="inactive">{t("inactive")}</TabsTrigger>
          </TabsList>
        </Tabs>
        <DropdownMenu
          onOpenChange={(open) => !open && setIsAddingCategory(false)}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "rounded-full flex items-center gap-1",
                categoryFilter !== "all" && "bg-muted font-bold"
              )}
            >
              {t("categories")} <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isAddingCategory ? (
              <div
                className="p-2 flex items-center gap-2"
                onKeyDown={(e) => e.stopPropagation()}
              >
                <Input
                  placeholder={t("newCategoryPlaceholder")}
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                  autoFocus
                />
                <Button size="icon" onClick={handleAddCategory}>
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <DropdownMenuItem onSelect={() => handleCategorySelect("All")}>
                  {t("allCategories")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {categories.map((cat) => (
                  <DropdownMenuItem
                    key={cat.name}
                    onSelect={(e) => e.preventDefault()}
                  >
                    <span
                      onClick={() => handleCategorySelect(cat.name)}
                      className="flex-grow p-2 -m-2"
                    >
                      {cat.name}
                    </span>
                    {onDeleteCategory && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onDeleteCategory(cat.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                {onAddCategory && (
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setIsAddingCategory(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t("addCategory")}
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

