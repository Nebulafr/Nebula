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
import { getCoaches } from "@/actions/coaches";
import { useCategories } from "@/contexts/category-context";

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
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [groupedCoaches, setGroupedCoaches] = useState<ApiCoachGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const { categories } = useCategories();

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
        } else {
          console.log("No coaches found in API");
          setGroupedCoaches([]);
        }
      } catch (err) {
        console.error("Error fetching coaches:", err);
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
            <Button
              variant="outline"
              className={cn(
                "rounded-full",
                activeCategory === "All" && "bg-muted font-bold"
              )}
              onClick={() => setActiveCategory("All")}
              disabled={loading}
            >
              {loading && activeCategory === "All" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category.slug}
                variant="outline"
                className={cn(
                  "rounded-full",
                  activeCategory === category.name && "bg-muted font-bold"
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
            filteredGroups.map(({ group, items }) => (
              <div key={group} className="mb-16">
                <h2 className="font-headline text-3xl font-bold text-left mb-8">
                  {group}
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {items.map((coach) => (
                    <Link key={coach.id} href={`/coaches/${coach.id}`}>
                      <Card className="flex w-full flex-col rounded-xl border transition-all hover:shadow-lg">
                        <CardContent className="flex flex-1 flex-col p-4">
                          <div className="flex flex-col items-center text-center">
                            <Avatar className="h-24 w-24">
                              <AvatarImage
                                src={
                                  coach.avatarUrl ||
                                  `https://i.pravatar.cc/96?u=${coach.fullName}`
                                }
                                alt={coach.fullName}
                              />
                              <AvatarFallback>
                                {coach.fullName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="mt-4">
                              <h3 className="font-headline text-lg font-semibold">
                                {coach.fullName}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {coach.title}
                              </p>
                              <div className="mt-2 flex items-center justify-center gap-1">
                                <Star className="h-2 w-2 text-yellow-500 fill-yellow-500" />
                                <span className="text-[10px] font-semibold">
                                  {coach.rating}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 text-center">
                            <div className="flex flex-wrap justify-center gap-2">
                              {coach.specialties
                                .slice(0, 3)
                                .map((specialty) => (
                                  <Badge key={specialty} variant="secondary">
                                    {specialty}
                                  </Badge>
                                ))}
                              {coach.specialties.length > 3 && (
                                <Badge variant="secondary">
                                  +{coach.specialties.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex-grow" />
                          <div className="mt-4 flex items-center justify-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {coach.studentsCoached}+ students
                            </span>
                          </div>
                          <Button variant="outline" className="mt-4 w-full">
                            View Profile
                          </Button>
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
