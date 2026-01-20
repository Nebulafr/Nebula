"use client";

import { Card, CardContent } from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface IProgram extends Omit<Program, 'category' | 'coach' | 'rating' | 'currentEnrollments'> {
  category: {
    id: string;
    name: string;
    slug?: string;
  };
  coach: any;
  modules?: any[];
  attendees?: string[];
  otherAttendees?: number;
  rating?: number | null;
  currentEnrollments?: number;
  students?: number;
  _count?: {
    enrollments?: number;
    reviews?: number;
  };
}

interface ProgramCardProps {
  program: IProgram;
}

export function ProgramCard({ program }: ProgramCardProps) {
  return (
    <Card className="flex flex-col">
      <CardContent className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
            {program.category.name === "Career Prep" ? (
              <Briefcase className="h-6 w-6 text-blue-600" />
            ) : (
              <GraduationCap className="h-6 w-6 text-blue-600" />
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-1">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/coach-dashboard/programs/${program.id}/edit`}>Edit</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/programs/${program.slug}`}>View Details</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Add Session</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Archive</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <h3 className="font-semibold text-lg">{program.title}</h3>
        <p className="text-sm text-muted-foreground">{program.category.name}</p>
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span>{program.rating || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{program.currentEnrollments || 0} students</span>
          </div>
        </div>
        <div className="flex-grow" />
        <div className="flex items-center gap-2 w-full mt-6">
          <Button variant="outline" className="w-full" asChild>
            <Link href={`/programs/${program.slug}`}>View Details</Link>
          </Button>
          <Button className="w-full">Run Program</Button>
        </div>
      </CardContent>
    </Card>
  );
}
