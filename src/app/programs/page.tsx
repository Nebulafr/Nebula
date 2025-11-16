"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogOut, Star, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/layout/footer";
import { useUser } from "@/hooks/use-user";
import { getAuth, signOut } from "firebase/auth";
import { getActivePrograms } from "@/firebase/firestore/program";
import { getCoach } from "@/firebase/firestore/coach";
import type { IProgram, ICoach } from "@/models";

type ProgramWithCoach = IProgram & {
  coachData?: ICoach;
};

const mockProgramsData = [
  {
    group: "Career Prep",
    items: [
      {
        category: "Career Prep",
        title: "Consulting, Associate Level",
        description: "Here's a short text that describes the program.",
        coach: {
          name: "Adrian Cucurella",
          role: "Partner, BCG",
          avatar: `https://i.pravatar.cc/40?u=adrian`,
        },
        attendees: [
          `https://i.pravatar.cc/40?u=1`,
          `https://i.pravatar.cc/40?u=2`,
          `https://i.pravatar.cc/40?u=3`,
        ],
        otherAttendees: 32,
        rating: 4.9,
        slug: "consulting-associate-level",
      },
    ],
  },
  {
    group: "School Admissions",
    items: [
      {
        category: "School Admissions",
        title: "Statement of Purpose",
        description: "Here's a short text that describes the program.",
        coach: {
          name: "Sarah Hughes",
          role: "Coach",
          avatar: `https://i.pravatar.cc/40?u=sarah-hughes`,
        },
        attendees: [
          `https://i.pravatar.cc/40?u=4`,
          `https://i.pravatar.cc/40?u=5`,
          `https://i.pravatar.cc/40?u=6`,
        ],
        otherAttendees: 28,
        rating: 4.8,
        slug: "statement-of-purpose",
      },
    ],
  },
  {
    group: "Skill Assessment",
    items: [
      {
        category: "Skill Assessment",
        title: "Product roadmap",
        description: "Here's a short text that describes the program.",
        coach: {
          name: "Natasha Daniels",
          role: "Coach",
          avatar: `https://i.pravatar.cc/40?u=natasha-daniels`,
        },
        attendees: [
          `https://i.pravatar.cc/40?u=7`,
          `https://i.pravatar.cc/40?u=8`,
          `https://i.pravatar.cc/40?u=9`,
        ],
        otherAttendees: 15,
        rating: 4.7,
        slug: "product-roadmap",
      },
    ],
  },
];

const programsData = [
  {
    group: "Career Prep",
    items: [
      {
        category: "Career Prep",
        title: "Consulting, Associate Level",
        description: "Here's a short text that describes the program.",
        coach: {
          name: "Adrian Cucurella",
          role: "Partner, BCG",
          avatar: `https://i.pravatar.cc/40?u=adrian`,
        },
        attendees: [
          `https://i.pravatar.cc/40?u=1`,
          `https://i.pravatar.cc/40?u=2`,
          `https://i.pravatar.cc/40?u=3`,
          `https://i.pravatar.cc/40?u=4`,
          `https://i.pravatar.cc/40?u=5`,
        ],
        otherAttendees: 32,
        rating: 4.9,
        slug: "consulting-associate-level",
      },
      {
        category: "Career Prep",
        title: "Consulting, Associate Level",
        description: "Here's a short text that describes the program.",
        coach: {
          name: "Adrian Cucurella",
          role: "Coach",
          avatar: `https://i.pravatar.cc/40?u=adrian`,
        },
        attendees: [
          `https://i.pravatar.cc/40?u=6`,
          `https://i.pravatar.cc/40?u=7`,
          `https://i.pravatar.cc/40?u=8`,
          `https://i.pravatar.cc/40?u=9`,
          `https://i.pravatar.cc/40?u=10`,
        ],
        otherAttendees: 32,
        rating: 4.9,
        slug: "consulting-associate-level",
      },
      {
        category: "Career Prep",
        title: "Consulting, Associate Level",
        description: "Here's a short text that describes the program.",
        coach: {
          name: "Adrian Cucurella",
          role: "Coach",
          avatar: `https://i.pravatar.cc/40?u=adrian`,
        },
        attendees: [
          `https://i.pravatar.cc/40?u=11`,
          `https://i.pravatar.cc/40?u=12`,
          `https://i.pravatar.cc/40?u=13`,
          `https://i.pravatar.cc/40?u=14`,
          `https://i.pravatar.cc/40?u=15`,
        ],
        otherAttendees: 32,
        rating: 4.9,
        slug: "consulting-associate-level",
      },
      {
        category: "Career Prep",
        title: "Consulting, Associate Level",
        description: "Here's a short text that describes the program.",
        coach: {
          name: "Adrian Cucurella",
          role: "Coach",
          avatar: `https://i.pravatar.cc/40?u=adrian`,
        },
        attendees: [
          `https://i.pravatar.cc/40?u=16`,
          `https://i.pravatar.cc/40?u=17`,
          `https://i.pravatar.cc/40?u=18`,
          `https://i.pravatar.cc/40?u=19`,
          `https://i.pravatar.cc/40?u=20`,
        ],
        otherAttendees: 32,
        rating: 4.9,
        slug: "consulting-associate-level",
      },
    ],
  },
  {
    group: "School Admissions",
    items: [
      {
        category: "School Admissions",
        title: "Statement of Purpose",
        description: "Here's a short text that describes the program.",
        coach: {
          name: "Sarah Hughes",
          role: "Coach",
          avatar: `https://i.pravatar.cc/40?u=sarah-hughes`,
        },
        attendees: [
          `https://i.pravatar.cc/40?u=21`,
          `https://i.pravatar.cc/40?u=22`,
          `https://i.pravatar.cc/40?u=23`,
          `https://i.pravatar.cc/40?u=24`,
          `https://i.pravatar.cc/40?u=25`,
        ],
        otherAttendees: 32,
        rating: 4.9,
        slug: "statement-of-purpose",
      },
      {
        category: "School Admissions",
        title: "Statement of Purpose",
        description: "Here's a short text that describes the program.",
        coach: {
          name: "Sarah Hughes",
          role: "Coach",
          avatar: `https://i.pravatar.cc/40?u=sarah-hughes`,
        },
        attendees: [
          `https://i.pravatar.cc/40?u=26`,
          `https://i.pravatar.cc/40?u=27`,
          `https://i.pravatar.cc/40?u=28`,
          `https://i.pravatar.cc/40?u=29`,
          `https://i.pravatar.cc/40?u=30`,
        ],
        otherAttendees: 32,
        rating: 4.9,
        slug: "statement-of-purpose",
      },
      {
        category: "School Admissions",
        title: "Statement of Purpose",
        description: "Here's a short text that describes the program.",
        coach: {
          name: "Sarah Hughes",
          role: "Coach",
          avatar: `https://i.pravatar.cc/40?u=sarah-hughes`,
        },
        attendees: [
          `https://i.pravatar.cc/40?u=31`,
          `https://i.pravatar.cc/40?u=32`,
          `https://i.pravatar.cc/40?u=33`,
          `https://i.pravatar.cc/40?u=34`,
          `https://i.pravatar.cc/40?u=35`,
        ],
        otherAttendees: 32,
        rating: 4.9,
        slug: "statement-of-purpose",
      },
      {
        category: "School Admissions",
        title: "Statement of Purpose",
        description: "Here's a short text that describes the program.",
        coach: {
          name: "Sarah Hughes",
          role: "Coach",
          avatar: `https://i.pravatar.cc/40?u=sarah-hughes`,
        },
        attendees: [
          `https://i.pravatar.cc/40?u=36`,
          `https://i.pravatar.cc/40?u=37`,
          `https://i.pravatar.cc/40?u=38`,
          `https://i.pravatar.cc/40?u=39`,
          `https://i.pravatar.cc/40?u=40`,
        ],
        otherAttendees: 32,
        rating: 4.9,
        slug: "statement-of-purpose",
      },
    ],
  },
  {
    group: "Skill Assessment",
    items: [
      {
        category: "Skill Assessment",
        title: "Product roadmap",
        description: "Here's a short text that describes the program.",
        coach: {
          name: "Natasha Daniels",
          role: "Coach",
          avatar: `https://i.pravatar.cc/40?u=natasha-daniels`,
        },
        attendees: [
          `https://i.pravatar.cc/40?u=41`,
          `https://i.pravatar.cc/40?u=42`,
          `https://i.pravatar.cc/40?u=43`,
          `https://i.pravatar.cc/40?u=44`,
          `https://i.pravatar.cc/40?u=45`,
        ],
        otherAttendees: 32,
        rating: 4.9,
        slug: "product-roadmap",
      },
      {
        category: "Skill Assessment",
        title: "Product roadmap",
        description: "Here's a short text that describes the program.",
        coach: {
          name: "Natasha Daniels",
          role: "Coach",
          avatar: `https://i.pravatar.cc/40?u=natasha-daniels`,
        },
        attendees: [
          `https://i.pravatar.cc/40?u=46`,
          `https://i.pravatar.cc/40?u=47`,
          `https://i.pravatar.cc/40?u=48`,
          `https://i.pravatar.cc/40?u=49`,
          `https://i.pravatar.cc/40?u=50`,
        ],
        otherAttendees: 32,
        rating: 4.9,
        slug: "product-roadmap",
      },
      {
        category: "Skill Assessment",
        title: "Product roadmap",
        description: "Here's a short text that describes the program.",
        coach: {
          name: "Natasha Daniels",
          role: "Coach",
          avatar: `https://i.pravatar.cc/40?u=natasha-daniels`,
        },
        attendees: [
          `https://i.pravatar.cc/40?u=51`,
          `https://i.pravatar.cc/40?u=52`,
          `https://i.pravatar.cc/40?u=53`,
          `https://i.pravatar.cc/40?u=54`,
          `https://i.pravatar.cc/40?u=55`,
        ],
        otherAttendees: 32,
        rating: 4.9,
        slug: "product-roadmap",
      },
      {
        category: "Skill Assessment",
        title: "Product roadmap",
        description: "Here's a short text that describes the program.",
        coach: {
          name: "Natasha Daniels",
          role: "Coach",
          avatar: `https://i.pravatar.cc/40?u=natasha-daniels`,
        },
        attendees: [
          `https://i.pravatar.cc/40?u=56`,
          `https://i.pravatar.cc/40?u=57`,
          `https://i.pravatar.cc/40?u=58`,
          `https://i.pravatar.cc/40?u=59`,
          `https://i.pravatar.cc/40?u=60`,
        ],
        otherAttendees: 32,
        rating: 4.9,
        slug: "product-roadmap",
      },
    ],
  },
];

export default function ProgramsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [programs, setPrograms] = useState<ProgramWithCoach[]>([]);
  const [loading, setLoading] = useState(true);
  const [programsData, setProgramsData] = useState(mockProgramsData);

  console.log({ programsData });

  const categories = [
    "All",
    "Career Prep",
    "School Admission",
    "Skill Assessment",
  ];

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const activePrograms = await getActivePrograms(20);
        console.log("Fetched active programs:", activePrograms);

        if (activePrograms.length > 0) {
          const programsWithCoaches = await Promise.all(
            activePrograms.map(async (program) => {
              try {
                const coachData = await getCoach(program.coachRef);
                return { ...program, coachData };
              } catch (error) {
                console.error("Error fetching coach data:", error);
                return program;
              }
            })
          );

          const groupedPrograms = programsWithCoaches.reduce((acc, program) => {
            const category = program.category;
            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push(program as IProgram);
            return acc;
          }, {} as Record<string, ProgramWithCoach[]>);

          const formattedData = Object.entries(groupedPrograms).map(
            ([group, items]) => ({
              group,
              items: items.map((item) => ({
                category: item.category,
                title: item.title,
                description: item.description,
                coach: {
                  name: item.coachData?.fullName || "Unknown Coach",
                  role: item.coachData?.title || "Coach",
                  avatar:
                    item.coachData?.avatarUrl ||
                    `https://i.pravatar.cc/40?u=${item.coachData?.fullName}`,
                },
                attendees: [],
                otherAttendees: item.currentEnrollments || 0,
                rating: item.rating || 0,
                slug: item.slug,
              })),
            })
          );

          setProgramsData(formattedData);
        } else {
          setProgramsData(mockProgramsData);
        }
      } catch (error) {
        console.error("Error fetching programs:", error);
        setProgramsData(mockProgramsData);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const filteredGroups = programsData
    .map((group) => {
      if (activeCategory === "All") {
        return group;
      }
      if (
        group.group
          .toLowerCase()
          .startsWith(activeCategory.toLowerCase().substring(0, 6))
      ) {
        return group;
      }
      return null;
    })
    .filter(Boolean);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="container py-12 text-center md:py-24">
          <h1 className="font-headline text-5xl font-bold tracking-tighter text-primary md:text-6xl">
            +50 Programs on Nebula
          </h1>
          <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-foreground/70">
            This is an amazing text description of the programs available on the
            Nebula platform. This text is intentionally long because we want
            more characters to fill this space.
          </p>
          <div className="mx-auto mt-8 flex max-w-lg flex-wrap justify-center gap-4">
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
          {filteredGroups.map((group, index) => (
            <div key={group!.group}>
              <div className="mb-16">
                <h2 className="font-headline text-3xl font-bold text-left mb-8">
                  {group!.group}
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {group!.items.map((program, programIndex) => (
                    <Link
                      key={programIndex}
                      href={`/programs/${program.slug}`}
                      className="flex"
                    >
                      <Card className="flex min-h-[340px] w-full flex-col overflow-hidden rounded-xl shadow-none transition-shadow hover:shadow-lg">
                        <CardContent className="flex flex-1 flex-col justify-between p-4">
                          <div className="flex-1">
                            <Badge
                              variant="secondary"
                              className="bg-muted text-muted-foreground"
                            >
                              {program.category}
                            </Badge>
                            <h3 className="font-headline mt-3 text-base font-semibold leading-tight">
                              {program.title}
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {program.description}
                            </p>
                          </div>
                          <div className="mt-4">
                            <div className="mb-4 rounded-lg border bg-background p-3">
                              <div className="flex items-center gap-3">
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
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                {program.attendees &&
                                program.attendees.length > 0 ? (
                                  <>
                                    <div className="flex -space-x-2">
                                      {program.attendees
                                        .slice(0, 3)
                                        .map((attendee, i) => (
                                          <Avatar
                                            key={i}
                                            className="h-6 w-6 border-2 border-background"
                                          >
                                            <AvatarImage src={attendee} />
                                            <AvatarFallback>A</AvatarFallback>
                                          </Avatar>
                                        ))}
                                    </div>
                                    {program.otherAttendees > 0 && (
                                      <span className="ml-2 text-xs font-medium text-muted-foreground">
                                        +{program.otherAttendees}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-xs font-medium text-muted-foreground">
                                      {program.otherAttendees} students
                                    </span>
                                  </div>
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
                          </div>
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
              className="font-menu text-sm font-medium text-foreground"
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
