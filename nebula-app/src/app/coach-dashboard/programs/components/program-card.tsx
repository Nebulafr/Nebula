"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Users,
  Star,
  Briefcase,
  GraduationCap,
  FileSignature,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Program } from "@/generated/prisma";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPost } from "@/lib/utils";
import { toast } from "react-toastify";
import { handleAndToastError } from "@/lib/error-handler";

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

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    PENDING_APPROVAL: { label: "Pending Review", variant: "secondary" },
    APPROVED: { label: "Approved - Sign & Submit", variant: "outline" },
    SUBMITTED: { label: "Submitted", variant: "secondary" },
    ACTIVE: { label: "Active", variant: "default" },
    INACTIVE: { label: "Inactive", variant: "outline" },
    REJECTED: { label: "Rejected", variant: "destructive" },
  };
  return statusConfig[status] || { label: status, variant: "outline" as const };
};

export function ProgramCard({ program }: ProgramCardProps) {
  const queryClient = useQueryClient();
  const statusBadge = getStatusBadge(program.status);

  const submitMutation = useMutation({
    mutationFn: async () => {
      return apiPost(`/programs/id/${program.id}/submit`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
    },
    onError: (error: any) => {
      handleAndToastError(error, "Failed to submit program");
    },
  });

  const handleSubmit = () => {
    submitMutation.mutate();
  };

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
        <div className="mb-2">
          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
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

        {/* Show Submit button for APPROVED programs */}
        {program.status === "APPROVED" && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
              Your program has been approved! Sign the collaboration document and submit for publishing.
            </p>
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileSignature className="mr-2 h-4 w-4" />
              )}
              Submit for Publishing
            </Button>
          </div>
        )}

        {/* Show different actions based on status */}
        {program.status === "ACTIVE" && (
          <div className="flex items-center gap-2 w-full mt-6">
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/programs/${program.slug}`}>View Details</Link>
            </Button>
            <Button className="w-full">Run Program</Button>
          </div>
        )}

        {program.status === "PENDING_APPROVAL" && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Your program is under review. You'll be notified once it's approved.
            </p>
          </div>
        )}

        {program.status === "SUBMITTED" && (
          <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Your program has been submitted. Waiting for admin to publish.
            </p>
          </div>
        )}

        {program.status === "REJECTED" && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-300">
              This program was not approved. Please contact support for more information.
            </p>
          </div>
        )}

        {(program.status === "INACTIVE" || !program.status) && (
          <div className="flex items-center gap-2 w-full mt-6">
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/programs/${program.slug}`}>View Details</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
