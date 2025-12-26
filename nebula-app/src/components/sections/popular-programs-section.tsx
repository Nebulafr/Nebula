"use client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { usePopularPrograms } from "@/hooks";
import { Button } from "../ui/button";

export function PopularProgramsSection() {
  const { data: programsResponse, isLoading: loading } = usePopularPrograms({
    limit: 3,
  });
  const programs = programsResponse?.data?.programs || [];
  return (
    <section className="bg-light-gray py-20 sm:py-32">
      <div className="container">
        <div className="text-left">
          <h2 className="font-headline">Popular Programs</h2>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Explore our most sought-after coaching programs designed for
            success.
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
              <Link
                key={program.title}
                href={`/programs/${program.slug}`}
                className="flex"
              >
                <Card className="flex w-full flex-col overflow-hidden rounded-xl shadow-none transition-shadow hover:shadow-lg">
                  <CardContent className="flex flex-1 flex-col justify-between p-6">
                    <div className="flex-1">
                      <Badge
                        variant="secondary"
                        className="bg-muted text-muted-foreground"
                      >
                        {program.category.name}
                      </Badge>
                      <h3 className="font-headline mt-4 text-2xl font-semibold leading-tight">
                        {program.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {program.description}
                      </p>
                    </div>
                    <div className="mt-6">
                      <div className="mb-6 rounded-lg border bg-background p-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={program.coach?.user?.avatarUrl} />
                            <AvatarFallback>
                              {program.coach?.user?.fullName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-headline font-semibold text-foreground">
                              {program.coach?.user.fullName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {program.coach.title}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex -space-x-2">
                            {program.attendees?.map(
                              (attendee: any, i: number) => (
                                <Avatar
                                  key={i}
                                  className="h-8 w-8 border-2 border-background"
                                >
                                  <AvatarImage src={attendee} />
                                  <AvatarFallback>A</AvatarFallback>
                                </Avatar>
                              )
                            )}
                          </div>
                          {program._count?.enrollments > 0 && (
                            <span className="ml-3 text-sm font-medium text-muted-foreground">
                              +{program._count?.enrollments - 3}
                            </span>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 border-yellow-400 bg-yellow-50/50 px-1 py-0.5 text-[10px]"
                        >
                          <Star className="h-2 w-2 fill-current text-yellow-500" />
                          <span className="font-semibold">
                            {program.rating}
                          </span>
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center">
              <p className="text-muted-foreground">
                No upcoming events at the moment.
              </p>
              <Button asChild className="mt-4">
                <Link href="/events">Explore All Events</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
