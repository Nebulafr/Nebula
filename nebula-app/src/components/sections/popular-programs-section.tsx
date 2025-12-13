"use client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { transformedPrograms } from "../../../data/programs";

export function PopularProgramsSection() {
  const programs = transformedPrograms.slice(0, 3);
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
          {programs.map((program) => (
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
                          {program.attendees.map((attendee, i) => (
                            <Avatar
                              key={i}
                              className="h-8 w-8 border-2 border-background"
                            >
                              <AvatarImage src={attendee} />
                              <AvatarFallback>A</AvatarFallback>
                            </Avatar>
                          ))}
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
                        <span className="font-semibold">{program.rating}</span>
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
