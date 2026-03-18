"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Power, PowerOff, Calendar, Hash } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface CategoriesGridProps {
  categories: any[];
  onEdit: (category: any) => void;
  onDelete: (category: any) => void;
  onToggleStatus: (category: any) => void;
}

export function CategoriesGrid({
  categories,
  onEdit,
  onDelete,
  onToggleStatus,
}: CategoriesGridProps) {
  const t = useTranslations("dashboard.admin");

  if (categories.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-md border border-dashed text-muted-foreground">
        {t("noResults")}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {categories.map((category) => (
        <Card key={category.id} className="overflow-hidden">
          <div className="relative aspect-video w-full bg-muted">
            {category.assetUrl ? (
              <Image
                src={category.assetUrl}
                alt={category.name}
                fill
                className="object-cover"
                unoptimized // Use unoptimized if the source is not always among the configured remotePatterns
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
            <div className="absolute top-2 right-2">
              <Badge variant={category.isActive ? "default" : "secondary"}>
                {category.isActive ? t("statusActive") : t("statusInactive")}
              </Badge>
            </div>
          </div>
          <CardHeader className="p-4 bg-transparent">
            <div className="flex items-start justify-between">
              <CardTitle className="line-clamp-1">{category.name}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(category)}>
                    <Edit className="mr-2 h-4 w-4" />
                    {t("edit")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggleStatus(category)}>
                    {category.isActive ? (
                      <>
                        <PowerOff className="mr-2 h-4 w-4" />
                        {t("deactivate")}
                      </>
                    ) : (
                      <>
                        <Power className="mr-2 h-4 w-4" />
                        {t("activate")}
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onDelete(category)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardDescription className="line-clamp-2 min-h-[2.5rem]">
              {category.description || "-"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-sm space-y-2">
             <div className="flex items-center text-muted-foreground">
              <Hash className="mr-2 h-3 w-3" />
              <span className="truncate">{category.slug}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Calendar className="mr-2 h-3 w-3" />
              <span>{new Date(category.createdAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
