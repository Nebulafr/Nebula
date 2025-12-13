"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Users,
  Star,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { Program } from "@/generated/prisma";

export interface IProgram extends Program {
  category: any;
  coach: any;
  modules: any[];
  attendees: string[];
  otherAttendees?: number;
}

interface ProgramCardProps {
  program: IProgram;
}

export function ProgramCard({ program }: ProgramCardProps) {
  return (
    <Card key={program.id} className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-lg ${
              program.category.name === "Career Prep"
                ? "bg-primary/10"
                : "bg-blue-500/10"
            }`}
          >
            {program.category.name === "Career Prep" ? (
              <Briefcase className="h-5 w-5 text-primary" />
            ) : (
              <GraduationCap className="h-5 w-5 text-blue-500" />
            )}
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <h3 className="font-headline text-xl font-semibold">{program.title}</h3>
        <p className="text-sm text-muted-foreground">{program.category.name}</p>
        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span>{program.rating || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{program.currentEnrollments || 0} students</span>
          </div>
        </div>
      </CardContent>
      <div className="p-6 pt-0">
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/programs/${program.slug}`}>View Details</Link>
        </Button>
      </div>
    </Card>
  );
}
