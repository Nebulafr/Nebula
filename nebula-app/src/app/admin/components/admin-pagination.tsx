"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useTranslations } from "next-intl";

interface PaginationProps {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function AdminPagination({
  total,
  page,
  limit,
  totalPages,
  onPageChange,
  isLoading = false,
}: PaginationProps) {
  const t = useTranslations("dashboard.admin");

  if (totalPages <= 1 && total <= limit) return null;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="flex-1 text-sm text-muted-foreground">
        {t("showingItems", { start: startItem, end: endItem, total })}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(1)}
          disabled={page === 1 || isLoading}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1 || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center px-4 space-x-1">
          <span className="text-sm font-medium">{page}</span>
          <span className="text-sm text-muted-foreground">{t("of")}</span>
          <span className="text-sm font-medium">{totalPages}</span>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages || isLoading}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages || isLoading}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
