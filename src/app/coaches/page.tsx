"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Linkedin,
  LogOut,
  Search,
  Star,
  Twitter,
  Users,
  Youtube,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "next/navigation";
import React from "react";
import { Footer } from "@/components/layout/footer";
import { useUser } from "@/hooks/use-user";
import { getAuth, signOut } from "firebase/auth";

const coachesData = [
  {
    group: "Career Prep",
    items: [
      {
        name: "Adrian Cucurella",
        role: "Partner, BCG",
        avatar: "https://i.pravatar.cc/150?u=adrian-cucurella",
        rating: 4.9,
        studentsCoached: 120,
        specialties: ["Career Prep", "Interview Skills"],
        slug: "adrian-cucurella",
        category: "Career Prep",
      },
      {
        name: "Sarah Chen",
        role: "Senior PM, Google",
        avatar: "https://i.pravatar.cc/150?u=sarah-chen",
        rating: 4.8,
        studentsCoached: 95,
        specialties: ["Product Management", "Resume Review"],
        slug: "sarah-chen",
        category: "Product Management",
      },
      {
        name: "Michael B. Jordan",
        role: "Actor, Director",
        avatar: "https://i.pravatar.cc/150?u=michael-jordan",
        rating: 4.9,
        studentsCoached: 150,
        specialties: ["Acting", "Film Direction"],
        slug: "michael-b-jordan",
        category: "Comedy",
      },
      {
        name: "Lisa Kudrow",
        role: "Comedian, Actress",
        avatar: "https://i.pravatar.cc/150?u=lisa-kudrow",
        rating: 4.7,
        studentsCoached: 80,
        specialties: ["Comedy", "Improvisation"],
        slug: "lisa-kudrow",
        category: "Comedy",
      },
    ],
  },
  {
    group: "School Admissions",
    items: [
      {
        name: "John Hughes",
        role: "Admissions Officer, Harvard",
        avatar: "https://i.pravatar.cc/150?u=john-hughes",
        rating: 4.9,
        studentsCoached: 200,
        specialties: ["Essay Writing", "College Apps"],
        slug: "john-hughes",
        category: "School Admission",
      },
      {
        name: "Emily Blunt",
        role: "Consultant, Bain",
        avatar: "https://i.pravatar.cc/150?u=emily-blunt",
        rating: 4.8,
        studentsCoached: 150,
        specialties: ["MBA Applications", "Interview Prep"],
        slug: "emily-blunt",
        category: "School Admission",
      },
    ],
  },
];

const allCoaches = coachesData.flatMap((group) => group.items);

function CoachesPageContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  const categories = [
    "All",
    "Career Prep",
    "School Admission",
    "Skill Assessment",
    "Product Management",
    "Comedy",
  ];

  const filteredCoaches = allCoaches.filter((coach) => {
    const categoryMatch =
      activeCategory === "All" || coach.category === activeCategory;
    const searchMatch =
      searchTerm === "" ||
      coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.specialties.some((s) =>
        s.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return categoryMatch && searchMatch;
  });

  const groupedCoaches = filteredCoaches.reduce((acc, coach) => {
    const groupKey =
      coach.specialties.includes("Career Prep") ||
      coach.specialties.includes("Product Management") ||
      coach.specialties.includes("Acting") ||
      coach.specialties.includes("Comedy")
        ? "Career Prep"
        : "School Admissions";
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(coach);
    return acc;
  }, {} as Record<string, typeof allCoaches>);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="container py-12 text-center md:py-24">
          <h1 className="font-headline text-5xl font-bold tracking-tighter text-primary md:text-6xl">
            Meet Our World-Class Coaches
          </h1>
          <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-foreground/70">
            Learn from the best. Our coaches are industry leaders and experts in
            their fields, ready to guide you to success.
          </p>
          <div className="mx-auto mt-8 relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by name or specialty"
              className="h-12 w-full rounded-full pl-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <Button
                key={category}
                variant="outline"
                className={cn(
                  "rounded-full",
                  activeCategory === category && "bg-muted font-bold"
                )}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </section>

        <section className="container pb-20">
          {Object.entries(groupedCoaches).map(([group, items]) => (
            <div key={group}>
              <div className="mb-16">
                <h2 className="font-headline text-3xl font-bold text-left mb-8">
                  {group}
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {items.map((coach, coachIndex) => (
                    <Link
                      key={coachIndex}
                      href={`/coaches/${coach.slug}`}
                      className="flex"
                    >
                      <Card className="flex w-full flex-col rounded-xl border transition-all hover:shadow-lg">
                        <CardContent className="flex flex-1 flex-col p-4">
                          <div className="flex flex-col items-center text-center">
                            <Avatar className="h-24 w-24">
                              <AvatarImage src={coach.avatar} />
                              <AvatarFallback>{coach.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="mt-4">
                              <h3 className="font-headline text-lg font-semibold">
                                {coach.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {coach.role}
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
                              {coach.specialties.map((specialty) => (
                                <Badge key={specialty} variant="secondary">
                                  {specialty}
                                </Badge>
                              ))}
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
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default function CoachesPage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <CoachesPageContent />
    </React.Suspense>
  );
}

function Header() {
  const { user, profile } = useUser();
  const auth = getAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };

  const dashboardUrl =
    profile?.role === "coach" ? "/coach-dashboard" : "/dashboard";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 max-w-screen-2xl items-center px-header mx-auto">
        <div className="flex flex-1 items-center gap-10">
          <Link href="/" className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-6 w-6 text-primary"
              fill="currentColor"
            >
              <path d="M12 0a12 12 0 1 0 12 12A12 12 0 0 0 12 0zm0 22a10 10 0 1 1 10-10 10 10 0 0 1-10 10zm0-18a8 8 0 1 0 8 8 8 8 0 0 0-8-8zm0 14a6 6 0 1 1 6-6 6 6 0 0 1-6 6zm0-10a4 4 0 1 0 4 4 4 4 0 0 0-4-4z" />
            </svg>
            <span className="font-headline text-xl font-bold">Nebula</span>
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
            <Link
              href="/programs"
              className="font-menu text-sm font-medium text-foreground/60 transition-colors hover:text-foreground/80"
            >
              Programs
            </Link>
            <Link
              href="/events"
              className="font-menu text-sm font-medium text-foreground/60 transition-colors hover:text-foreground/80"
            >
              Events
            </Link>
            <Link
              href="/become-a-coach"
              className="font-menu text-sm font-medium text-foreground/60 transition-colors hover:text-foreground/80"
            >
              Become a coach
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
          {user ? (
            <>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
              <Button asChild>
                <Link href={dashboardUrl}>Dashboard</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
