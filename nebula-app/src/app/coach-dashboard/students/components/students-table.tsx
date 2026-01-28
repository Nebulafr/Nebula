"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, MessageSquare, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getDefaultAvatar } from "@/lib/event-utils";
import { useTranslations } from "next-intl";

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  program: string;
  status: "active" | "paused" | "completed" | "cancelled";
  lastSession?: string;
}

interface StudentsTableProps {
  students: Student[];
  loading?: boolean;
  onMessageStudent?: (studentId: string) => void;
  onScheduleSession?: (studentId: string) => void;
  onViewProfile?: (studentId: string) => void;
  onRemoveStudent?: (studentId: string) => void;
}

export function StudentsTable({
  students,
  loading = false,
  onMessageStudent,
  onScheduleSession,
  onViewProfile,
  onRemoveStudent,
}: StudentsTableProps) {
  const t = useTranslations("dashboard.coach.students.table");
  
  const getStatusColor = (status: Student["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center space-x-4 p-4 animate-pulse"
          >
            <div className="h-10 w-10 rounded-full bg-gray-200" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
            <div className="h-6 w-16 bg-gray-200 rounded" />
            <div className="h-8 w-20 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{t("noStudents")}</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("name")}</TableHead>
          <TableHead>{t("program")}</TableHead>
          <TableHead>{t("status")}</TableHead>
          <TableHead>{t("lastSession")}</TableHead>
          <TableHead className="text-right">{t("actions")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student.id}>
            <TableCell>
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage
                    src={student.avatar || getDefaultAvatar(student.name)}
                  />
                  <AvatarFallback>
                    {student.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{student.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {student.email}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>{student.program}</TableCell>
            <TableCell>
              <Badge className={getStatusColor(student.status)}>
                {t(student.status)}
              </Badge>
            </TableCell>

            <TableCell>
              <div className="text-sm">
                {student.lastSession || t("noSessions")}
              </div>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onMessageStudent?.(student.id)}
                  title={t("message")}
                >
                  <MessageSquare className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onScheduleSession?.(student.id)}
                  title={t("schedule")}
                >
                  <Calendar className="h-3 w-3" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onViewProfile?.(student.id)}
                    >
                      {t("viewProfile")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onMessageStudent?.(student.id)}
                    >
                      {t("message")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onScheduleSession?.(student.id)}
                    >
                      {t("schedule")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onRemoveStudent?.(student.id)}
                      className="text-red-600"
                    >
                      {t("remove")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
