"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Star, Users, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "next/navigation";
import React from "react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { getCoaches, type CoachGroup } from "@/actions/coaches";
import type { Coach } from "@/generated/prisma";

// Simple fallback data structure
const mockCoachesData = [
  {
    group: "Loading...",
    items: [],
  },
];

function CoachesPageContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [groupedCoaches, setGroupedCoaches] = useState<CoachGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { name: "All", slug: "all" },
    { name: "Career Prep", slug: "career-prep" },
    { name: "Product Management", slug: "product-management" },
    { name: "Technology", slug: "technology" },
    { name: "Design", slug: "design" },
    { name: "Marketing", slug: "marketing" },
  ];

  useEffect(() => {
    const fetchCoaches = async () => {
      setLoading(true);
      try {
        const response = await getCoaches({
          search: searchTerm as string,
          category: activeCategory === "All" ? undefined : activeCategory,
          limit: 20,
        });

        if (response.success && response.data?.groupedCoaches) {
          setGroupedCoaches(response.data.groupedCoaches);
          setCoaches(response.data!.coaches! || []);
        } else {
          // No real coaches found, use empty structure
          console.log("No coaches found in API");
          setCoaches([]);
          setGroupedCoaches([]);
        }
      } catch (err) {
        console.error("Error fetching coaches:", err);
        setCoaches([]);
        setGroupedCoaches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCoaches();
  }, [searchTerm, activeCategory]);

  const filteredGroups = groupedCoaches.filter((group) => {
    if (activeCategory === "All") return group.items.length > 0;
    return group.group === activeCategory && group.items.length > 0;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading coaches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="container py-20 text-center">
          <Badge variant="secondary" className="mb-4">
            Coaches
          </Badge>
          <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
            Find the perfect coach for your goals
          </h1>
          <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-foreground/70">
            Connect with experienced professionals who can guide you towards
            your career objectives. Browse coaches by specialty and find the
            perfect match.
          </p>

          <div className="mx-auto mt-8 flex max-w-lg items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search coaches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

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
            filteredGroups.map(({ group, items }) => (
              <div key={group} className="mb-16">
                <h2 className="font-headline text-3xl font-bold text-left mb-8">
                  {group}
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((coach) => (
                    <Link key={coach.id} href={`/coaches/${coach.slug}`}>
                      <Card className="transition-all hover:shadow-lg hover:-translate-y-1">
                        <CardContent className="p-6">
                          <div className="mb-4 flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage
                                src={
                                  coach.avatarUrl ||
                                  `https://i.pravatar.cc/48?u=${coach.id}`
                                }
                                alt={coach!.fullName!}
                              />
                              <AvatarFallback>
                                {coach
                                  .fullName!.split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-headline text-lg font-semibold truncate">
                                {coach.fullName}
                              </h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {coach.title}
                              </p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <div className="flex flex-wrap gap-1">
                              {coach.specialties
                                ?.slice(0, 2)
                                .map((specialty, i) => (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {specialty}
                                  </Badge>
                                ))}
                              {coach.specialties &&
                                coach.specialties.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{coach.specialties.length - 2}
                                  </Badge>
                                )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">
                                {coach.rating || 4.5}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span className="text-sm">
                                {coach.studentsCoached || 0}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">
                {searchTerm
                  ? `No coaches found matching "${searchTerm}"`
                  : "No coaches available at the moment"}
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
