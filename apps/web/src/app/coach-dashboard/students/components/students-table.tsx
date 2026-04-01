"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MessageSquare, Calendar } from "lucide-react";
import { getUserAvatar, getInitials } from "@/lib/utils";
import { useTranslations } from "next-intl";

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  program: string;
  lastSession?: string;
}

interface StudentsTableProps {
  students: Student[];
  loading?: boolean;
  onMessageStudent?: (studentId: string) => void;
  onScheduleSession?: (studentId: string) => void;
}

export function StudentsTable({
  students,
  loading = false,
  onMessageStudent,
  onScheduleSession,
}: StudentsTableProps) {
  const t = useTranslations("dashboard.coach.students.table");

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
                    src={student.avatar || getUserAvatar(student.name)}
                  />
                  <AvatarFallback>
                    {getInitials(student.name)}
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
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {t("message")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onScheduleSession?.(student.id)}
                  title={t("reschedule")}
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  {t("reschedule")}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
