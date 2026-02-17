"use client";
import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { useCategories, useGroupedPrograms } from "@/hooks";
import { ProgramWithRelations } from "@/types/program";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { ProgramCard } from "@/components/cards/program-card";



export default function ProgramsPage() {
  const t = useTranslations("programs");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { data: categoriesResponse } = useCategories();
  const { data: programsResponse, isLoading: loading } = useGroupedPrograms({
    limit: 50,
    category: activeCategory === "all" ? undefined : activeCategory,
    search: searchTerm || undefined,
  });

  const categories = categoriesResponse?.data?.categories || [];
  const filteredGroups = programsResponse?.data?.groupedPrograms || [];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="container py-20 text-center">
          <h1 className="font-headline text-3xl font-bold tracking-tighter text-primary sm:text-4xl md:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-foreground/70">
            {t("description")}
          </p>
          <div className="mx-auto mt-8 relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              className="h-12 w-full rounded-full pl-12"
              value={searchTerm || ""}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-4">
            <Button
              variant="outline"
              className={cn(
                "rounded-full",
                activeCategory === "all" && "bg-muted font-bold",
              )}
              onClick={() => setActiveCategory("all")}
              disabled={loading}
            >
              {loading && activeCategory === "all" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("all")}
            </Button>
            {categories.map((category: any) => (
              <Button
                key={category.slug}
                variant="outline"
                className={cn(
                  "rounded-full",
                  activeCategory === category?.name && "bg-muted font-bold",
                )}
                onClick={() => setActiveCategory(category?.name)}
                disabled={loading}
              >
                {loading && activeCategory === category.name && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {category.name}
              </Button>
            ))}
          </div>
        </section>

        <section className="container pb-20">
          {filteredGroups.length > 0 ? (
            filteredGroups.map((group: any) => (
              <div key={group!.group}>
                <div className="mb-16">
                  <h2 className="font-headline text-3xl font-bold text-left mb-8">
                    {group!.group}
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {group!.items.map(
                      (program: ProgramWithRelations, index: number) => (
                        <ProgramCard key={index} program={program as any} />
                      ),
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20">
              <h3 className="text-xl font-semibold mb-2">
                {t("noProgramsFound")}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? t("noProgramsMatching", { search: searchTerm, category: activeCategory })
                  : activeCategory === "all"
                    ? t("noProgramsAvailable")
                    : t("noProgramsInCategory", { category: activeCategory })}
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
