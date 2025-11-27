"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { getPrograms, getGroupedPrograms } from "@/actions/programs";
import { useCategories } from "@/contexts/CategoryContext";
import { Program } from "@/generated/prisma";

// Define the exact structure returned by the API
type ProgramWithRelations = Program & {
  category: {
    id: string;
    name: string;
  };
  coach: {
    id: string;
    title?: string;
    user: {
      id: string;
      fullName?: string;
      avatarUrl?: string;
    };
  };
  attendees?: string[]; // Avatar URLs from enrollments
  _count: {
    enrollments: number;
    reviews: number;
  };
};

export default function ProgramsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [programsData, setProgramsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { categories: _categories, refetch } = useCategories();

  const categories = [{ name: "All", slug: "all" }, ..._categories];

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const categoryParam = activeCategory === "All" ? undefined : activeCategory;
        const groupedPrograms = await getGroupedPrograms(50, categoryParam);
        console.log("Fetched grouped programs:", groupedPrograms);
        setProgramsData(groupedPrograms);
      } catch (error) {
        console.error("Error fetching programs:", error);
        setProgramsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
    refetch();
  }, [activeCategory]); // Refetch when category changes

  // API already handles filtering, so we can use the data directly
  const filteredGroups = programsData;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg">Loading programs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="container py-20 text-center">
          <h1 className="font-headline text-3xl font-bold tracking-tighter text-primary sm:text-4xl md:text-5xl lg:text-6xl">
            Programs to help you grow
          </h1>
          <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-foreground/70">
            This is an amazing text description of the programs available on the
            Nebula platform. This text is intentionally long because we want
            more characters to fill this space.
          </p>
          <div className="mx-auto mt-8 flex max-w-lg flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <Button
                key={category.slug}
                variant="outline"
                className={cn(
                  "rounded-full",
                  activeCategory === category.name && "bg-muted font-bold"
                )}
                onClick={() => setActiveCategory(category.name)}
              >
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
                    {group!.items.map((program: ProgramWithRelations, programIndex: number) => (
                      <Link
                        key={programIndex}
                        href={`/programs/${program.slug}`}
                      >
                        <Card className="flex min-h-[340px] w-full flex-col overflow-hidden rounded-xl shadow-none transition-shadow hover:shadow-lg">
                          <CardContent className="flex flex-1 flex-col justify-between p-4">
                            <div className="flex-1">
                              <Badge
                                variant="secondary"
                                className="bg-muted text-muted-foreground"
                              >
                                {program.category.name}
                              </Badge>
                              <h3 className="font-headline mt-3 text-base font-semibold leading-tight">
                                {program.title}
                              </h3>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {program.description}
                              </p>
                            </div>

                            <div className="mb-4 rounded-lg border bg-background p-3">
                              {/* <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={program.coach.avatar} />
                                  <AvatarFallback>
                                    {program.coach.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-headline text-xs font-semibold text-foreground">
                                    {program.coach.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {program.coach.role}
                                  </p>
                                </div>
                              </div> */}
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={program.coach?.user.avatarUrl}
                                    alt={program.coach?.user.fullName}
                                  />
                                  <AvatarFallback>
                                    {program.coach?.user.fullName
                                      ?.split(" ")
                                      .map((n: string) => n[0])
                                      .join("") || "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {program.coach?.user.fullName ||
                                      "Unknown Coach"}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {program.coach?.title || "Coach"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="flex -space-x-2">
                                  {program.attendees
                                    ?.slice(0, 3)
                                    .map((attendee: string, i: number) => (
                                      <Avatar
                                        key={i}
                                        className="h-6 w-6 border-2 border-background"
                                      >
                                        <AvatarImage src={attendee} />
                                        <AvatarFallback>A</AvatarFallback>
                                      </Avatar>
                                    ))}
                                </div>
                                {program._count.enrollments > 3 && (
                                  <span className="ml-2 text-xs font-medium text-muted-foreground">
                                    +{program._count.enrollments - 3}
                                  </span>
                                )}
                              </div>
                              <Badge
                                variant="outline"
                                className="flex items-center gap-1 border-yellow-400 bg-yellow-50/50 px-1 py-0.5 text-[10px] text-yellow-700"
                              >
                                <Star className="h-3 w-3 fill-current text-yellow-500" />
                                <span className="font-semibold">
                                  {program.rating}
                                </span>
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20">
              <h3 className="text-xl font-semibold mb-2">
                No Programs Available
              </h3>
              <p className="text-muted-foreground">
                {activeCategory === "All"
                  ? "There are currently no programs available. Please check back later."
                  : `No programs found in the "${activeCategory}" category.`}
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
