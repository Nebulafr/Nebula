"use client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { usePopularPrograms } from "@/hooks";
import { useTranslations } from "next-intl";
import { truncateText } from "@/lib/utils";
import { ProgramCard } from "@/components/cards/program-card";

export function PopularProgramsSection() {
  const t = useTranslations("programs.popular");
  const { data: programsResponse, isLoading: loading } = usePopularPrograms({
    limit: 3,
  });
  const programs = programsResponse?.data?.programs || [];
  return (
    <section className="bg-light-gray py-20 sm:py-32">
      <div className="container">
        <div className="text-left">
          <h2 className="font-headline">{t("title")}</h2>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            // Loading skeleton cards
            Array.from({ length: 3 }).map((_, i) => (
              <Card
                key={i}
                className="flex w-full flex-col overflow-hidden rounded-xl shadow-none"
              >
                <CardContent className="flex flex-1 flex-col justify-between p-6">
                  <div className="flex-1">
                    <div className="h-6 w-20 bg-gray-200 rounded animate-pulse mb-4"></div>
                    <div className="h-8 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-1"></div>
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="mt-6">
                    <div className="mb-6 rounded-lg border bg-background p-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="flex-1">
                          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex -space-x-2">
                          {Array.from({ length: 3 }).map((_, j) => (
                            <div
                              key={j}
                              className="h-8 w-8 bg-gray-200 rounded-full border-2 border-background animate-pulse"
                            />
                          ))}
                        </div>
                        <div className="ml-3 h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : programs.length > 0 ? (
            programs.map((program: any) => (
              <ProgramCard key={program.id} program={program} variant="public" />
            ))
          ) : (
            <div className="col-span-full text-center">
              <p className="text-muted-foreground">{t("empty")}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
