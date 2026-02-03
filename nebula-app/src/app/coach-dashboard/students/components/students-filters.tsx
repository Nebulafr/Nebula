"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Download, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";

interface StudentsFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  programFilter: string;
  onProgramFilterChange: (value: string) => void;
  programs?: string[];
  onAddStudent?: () => void;
  onExportStudents?: () => void;
}

export function StudentsFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  programFilter,
  onProgramFilterChange,
  programs = [],
  onAddStudent,
  onExportStudents,
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

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-32">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder={t("allStatuses")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allStatuses")}</SelectItem>
            <SelectItem value="active">{t("active")}</SelectItem>
            <SelectItem value="paused">{t("paused")}</SelectItem>
            <SelectItem value="completed">{t("completed")}</SelectItem>
            <SelectItem value="cancelled">{t("allStatuses")}</SelectItem> 
          </SelectContent>
        </Select>

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

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={onExportStudents}>
          <Download className="h-4 w-4 mr-2" />
          {t("export")}
        </Button>
        <Button onClick={onAddStudent}>
          <UserPlus className="h-4 w-4 mr-2" />
          {t("addStudent")}
        </Button>
      </div>
    </div>
  );
}