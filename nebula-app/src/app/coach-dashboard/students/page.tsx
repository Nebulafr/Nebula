"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

// Micro Components
import { StudentsTable, type Student } from "./components/students-table";
import { StudentsFilters } from "./components/students-filters";
import { StudentsStatsCards } from "./components/students-stats";
import { AddStudentDialog, type StudentFormData } from "./components/add-student-dialog";

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Mock data - replace with real API data
  const students: Student[] = [
    {
      id: "1",
      name: "Alex Thompson",
      email: "alex.thompson@example.com",
      avatar: "https://i.pravatar.cc/40?u=alex",
      program: "Consulting, Associate Level",
      status: "active",
      progress: 75,
      lastSession: "2 days ago",
      nextSession: "Tomorrow, 2:00 PM",
      totalSessions: 12,
    },
    {
      id: "2", 
      name: "Sarah K.",
      email: "sarah.k@example.com",
      avatar: "https://i.pravatar.cc/40?u=sarah",
      program: "MBA Admissions Coaching",
      status: "active",
      progress: 60,
      lastSession: "5 days ago",
      nextSession: "Monday, 4:00 PM",
      totalSessions: 8,
    },
    {
      id: "3",
      name: "Michael T.",
      email: "michael.t@example.com", 
      avatar: "https://i.pravatar.cc/40?u=michael",
      program: "Consulting, Associate Level",
      status: "completed",
      progress: 100,
      lastSession: "1 month ago",
      totalSessions: 20,
    },
    {
      id: "4",
      name: "Jessica L.",
      email: "jessica.l@example.com",
      avatar: "https://i.pravatar.cc/40?u=jessica",
      program: "Consulting, Associate Level", 
      status: "paused",
      progress: 45,
      lastSession: "3 weeks ago",
      totalSessions: 6,
    },
  ];

  const programs = ["Consulting, Associate Level", "MBA Admissions Coaching", "Leadership Development"];

  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    completed: students.filter(s => s.status === 'completed').length,
    paused: students.filter(s => s.status === 'paused').length,
  };

  // Filter students based on search and filters
  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;
    const matchesProgram = programFilter === "all" || student.program === programFilter;
    
    return matchesSearch && matchesStatus && matchesProgram;
  });

  const handleMessageStudent = (studentId: string) => {
    console.log("Message student:", studentId);
    // Navigate to messaging with student
  };

  const handleScheduleSession = (studentId: string) => {
    console.log("Schedule session with:", studentId);
    // Navigate to scheduling 
  };

  const handleViewProfile = (studentId: string) => {
    console.log("View profile:", studentId);
    // Navigate to student profile
  };

  const handleRemoveStudent = (studentId: string) => {
    console.log("Remove student:", studentId);
    // Show confirmation dialog and remove
  };

  const handleAddStudent = (studentData: StudentFormData) => {
    console.log("Add student:", studentData);
    // API call to add student
    setShowAddDialog(false);
  };

  const handleExportStudents = () => {
    console.log("Export students");
    // Export functionality
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Students</h1>
        <p className="text-muted-foreground">
          Manage your students and track their progress
        </p>
      </div>

      {/* Stats */}
      <StudentsStatsCards stats={stats} />

      {/* Filters and Actions */}
      <StudentsFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        programFilter={programFilter}
        onProgramFilterChange={setProgramFilter}
        programs={programs}
        onAddStudent={() => setShowAddDialog(true)}
        onExportStudents={handleExportStudents}
      />

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          <StudentsTable
            students={filteredStudents}
            onMessageStudent={handleMessageStudent}
            onScheduleSession={handleScheduleSession}
            onViewProfile={handleViewProfile}
            onRemoveStudent={handleRemoveStudent}
          />
        </CardContent>
      </Card>

      {/* Add Student Dialog */}
      <AddStudentDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        programs={programs}
        onAddStudent={handleAddStudent}
      />
    </div>
  );
}
