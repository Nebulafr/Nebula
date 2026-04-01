"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";

interface TransactionFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activeTab: string;
  onTabChange: (value: string) => void;
  loading?: boolean;
}

export function TransactionFilters({
  searchTerm,
  onSearchChange,
  activeTab,
  onTabChange,
  loading = false,
}: TransactionFiltersProps) {
  const t = useTranslations("dashboard.admin");
  
  if (loading) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
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
          <TabsTrigger value="all">{t("allTransactions")}</TabsTrigger>
          <TabsTrigger value="earning">{t("earnings")}</TabsTrigger>
          <TabsTrigger value="payout">{t("payouts")}</TabsTrigger>
          <TabsTrigger value="refund">{t("refunds")}</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input 
          placeholder={t("searchTransactions")} 
          className="pl-9 w-64 md:w-80"
          value={searchTerm || ""}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}
