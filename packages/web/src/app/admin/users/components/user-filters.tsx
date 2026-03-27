"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";

interface UserFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activeTab: string;
  onTabChange: (value: string) => void;
  loading?: boolean;
}

export function UserFilters({
  searchTerm,
  onSearchChange,
  activeTab,
  onTabChange,
  loading = false,
}: UserFiltersProps) {
  const t = useTranslations("dashboard.admin");
  if (loading) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
        <div className="flex items-center gap-4">
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList>
          <TabsTrigger value="all">{t("allUsers")}</TabsTrigger>
          <TabsTrigger value="student">{t("students")}</TabsTrigger>
          <TabsTrigger value="coach">{t("coaches")}</TabsTrigger>
          <TabsTrigger value="admin">{t("admins")}</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input 
          placeholder={t("searchUsers")} 
          className="pl-9"
          value={searchTerm || ""}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}