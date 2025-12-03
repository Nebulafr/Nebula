"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="student">Students</TabsTrigger>
          <TabsTrigger value="coach">Coaches</TabsTrigger>
          <TabsTrigger value="admin">Admins</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input 
          placeholder="Search users..." 
          className="pl-9"
          value={searchTerm || ""}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}