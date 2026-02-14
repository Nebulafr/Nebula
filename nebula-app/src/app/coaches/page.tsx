"use client";

import { useState } from "react";
import Link from "next/link";
import { CoachCard } from "@/components/cards/coach-card";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "next/navigation";
import React from "react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { useCategories, useCoaches } from "@/hooks";
import { useTranslations } from "next-intl";

// API response coach structure
interface ApiCoach {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  title: string;
  bio: string;
  style: string;
  specialties: string[];
  pastCompanies: string[];
  linkedinUrl?: string;
  availability: string;
  hourlyRate: number;
  rating: number;
  totalReviews: number;
  totalSessions: number;
  studentsCoached: number;
  isActive: boolean;
  isVerified: boolean;
  slug: string;
  category: string;
  qualifications: string[];
  experience?: string;
  timezone?: string;
  languages: string[];
  createdAt: string;
  updatedAt: string;
}

interface ApiCoachGroup {
  group: string;
  items: ApiCoach[];
}

function CoachesPageContent() {
  const t = useTranslations("coaches");
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  const { data: categoriesResponse } = useCategories();
  const { data: coachesResponse, isLoading: loading } = useCoaches({
    search: searchTerm,
    category: activeCategory === "all" ? undefined : activeCategory,
    limit: 20,
    grouped: true,
  });

  const categories = categoriesResponse?.data?.categories || [];
  const groupedCoaches = coachesResponse?.data?.groupedCoaches || [];

  const filteredGroups = groupedCoaches.filter((group: any) => {
    if (activeCategory === "all") return group.items.length > 0;
    return group.group === activeCategory && group.items.length > 0;
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="container py-20 text-center">
          <h1 className="font-headline text-3xl font-bold text-primary tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
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
                  activeCategory === category.name && "bg-muted font-bold",
                )}
                onClick={() => setActiveCategory(category.name)}
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
            filteredGroups.map(({ group, items }: any) => (
              <div key={group} className="mb-16">
                <h2 className="font-headline text-3xl font-bold text-left mb-8">
                  {group}
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {items.map((coach: any) => (
                    <Link key={coach.id} href={`/coaches/${coach.id}`}>
                      <CoachCard coach={coach} />
                    </Link>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">
                {searchTerm
                  ? t("noCoachesFound", { search: searchTerm })
                  : t("noCoachesAvailable")}
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default function CoachesPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <CoachesPageContent />
    </React.Suspense>
  );
}
