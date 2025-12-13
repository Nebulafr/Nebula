"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  CheckCircle,
  PauseCircle,
  Trash2,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { formatUserName, getUserInitials } from "@/lib/chat-utils";
import { AdminProgram } from "@/types/program";

interface ProgramsTableProps {
  programs: AdminProgram[];
  loading?: boolean;
  loadingActions?: Record<string, string>;
  onProgramAction?: (
    programId: string,
    action: "activate" | "deactivate" | "delete"
  ) => void;
  onViewDetails?: (program: AdminProgram) => void;
}

function getStatusVariant(status: string) {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "INACTIVE":
      return "secondary";
    default:
      return "outline";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "INACTIVE":
      return "Inactive";
    default:
      return status;
  }
}

export function ProgramsTable({
  programs,
  loading = false,
  loadingActions = {},
  onProgramAction,
  onViewDetails,
}: ProgramsTableProps) {
  if (loading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Program Title</TableHead>
            <TableHead>Coach</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={`skeleton-${index}`}>
              <TableCell className="font-medium">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                </div>
              </TableCell>
              <TableCell>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
              </TableCell>
              <TableCell>
                <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16" />
              </TableCell>
              <TableCell>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
              </TableCell>
              <TableCell className="text-right">
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Program Title</TableHead>
          <TableHead>Coach</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {programs.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={6}
              className="text-center py-8 text-muted-foreground"
            >
              No programs found matching your criteria.
            </TableCell>
          </TableRow>
        ) : (
          programs.map((program) => {
            const coachName = formatUserName(
              program.coach.user.fullName || "Unknown"
            );
            const coachInitials = getUserInitials(
              program.coach.user.fullName || "Unknown"
            );

            return (
              <TableRow key={program.id}>
                <TableCell className="font-medium">{program.title}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={program.coach.user.avatarUrl} />
                      <AvatarFallback>{coachInitials}</AvatarFallback>
                    </Avatar>
                    <span>{coachName}</span>
                  </div>
                </TableCell>
                <TableCell>{program.category.name}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(program.status)}>
                    {getStatusLabel(program.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(program.createdAt), "MMM dd, yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={!!loadingActions[program.id]}
                      >
                        {loadingActions[program.id] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreHorizontal className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => onViewDetails?.(program)}
                      >
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {program.status === "INACTIVE" && (
                        <DropdownMenuItem
                          onClick={() =>
                            onProgramAction?.(program.id, "activate")
                          }
                          disabled={!!loadingActions[program.id]}
                          className="text-green-600"
                        >
                          {loadingActions[program.id] === "activate" ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="mr-2 h-4 w-4" />
                          )}
                          {loadingActions[program.id] === "activate"
                            ? "Activating..."
                            : "Activate"}
                        </DropdownMenuItem>
                      )}
                      {program.status === "ACTIVE" && (
                        <DropdownMenuItem
                          onClick={() =>
                            onProgramAction?.(program.id, "deactivate")
                          }
                          disabled={!!loadingActions[program.id]}
                          className="text-orange-600"
                        >
                          {loadingActions[program.id] === "deactivate" ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <PauseCircle className="mr-2 h-4 w-4" />
                          )}
                          {loadingActions[program.id] === "deactivate"
                            ? "Deactivating..."
                            : "Deactivate"}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onProgramAction?.(program.id, "delete")}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
