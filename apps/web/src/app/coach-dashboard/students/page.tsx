"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";

// Micro Components
import { StudentsTable, type Student } from "./components/students-table";
import { StudentsFilters } from "./components/students-filters";
import { StudentsStatsCards } from "./components/students-stats";
import { useTranslations } from "next-intl";
import { useCoachStudents } from "@/hooks/use-coach-queries";
import moment from "moment";

export default function StudentsPage() {
  const t = useTranslations("dashboard.coach.students");
  const [searchTerm, setSearchTerm] = useState("");
  const [programFilter, setProgramFilter] = useState("all");

  const { data: studentsData, isLoading } = useCoachStudents();

  // Transform API data to Student format
  const students: Student[] = useMemo(() => {
    if (!studentsData) return [];
    return studentsData.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      avatar: s.avatar || undefined,
      program: s.program,
      lastSession: s.lastSession
        ? moment(new Date(s.lastSession)).fromNow()
        : undefined,
    }));
  }, [studentsData]);

  // Get unique programs for filter
  const programs = useMemo(() => {
    if (!studentsData) return [];
    const uniquePrograms = new Set(studentsData.map((s) => s.program));
    return Array.from(uniquePrograms).filter((p) => p !== "No Program");
  }, [studentsData]);

  const stats = {
    total: students.length,
    active: students.length,
    completed: 0,
    paused: 0,
  };

  // Filter students based on search and filters
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProgram =
      programFilter === "all" || student.program === programFilter;

    return matchesSearch && matchesProgram;
  });

  const handleMessageStudent = (studentId: string) => {
    console.log("Message student:", studentId);
    // Navigate to messaging with student
  };

  const handleScheduleSession = (studentId: string) => {
    console.log("Schedule session with:", studentId);
    // Navigate to scheduling
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      {/* Stats */}
      <StudentsStatsCards stats={stats} />

      {/* Filters */}
      <StudentsFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        programFilter={programFilter}
        onProgramFilterChange={setProgramFilter}
        programs={programs}
      />

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          <StudentsTable
            students={filteredStudents}
            loading={isLoading}
            onMessageStudent={handleMessageStudent}
            onScheduleSession={handleScheduleSession}
          />
        </CardContent>
      </Card>
    </div>
  );
}
