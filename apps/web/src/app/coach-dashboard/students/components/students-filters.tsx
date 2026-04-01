"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

interface StudentsFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  programFilter: string;
  onProgramFilterChange: (value: string) => void;
  programs?: string[];
}

export function StudentsFilters({
  searchTerm,
  onSearchChange,
  programFilter,
  onProgramFilterChange,
  programs = [],
}: StudentsFiltersProps) {
  const t = useTranslations("dashboard.coach.students.filters");

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div className="flex flex-1 gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("search")}
            value={searchTerm || ""}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Program Filter */}
        <Select value={programFilter} onValueChange={onProgramFilterChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t("allPrograms")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allPrograms")}</SelectItem>
            {programs.map((program) => (
              <SelectItem key={program} value={program}>
                {program}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}