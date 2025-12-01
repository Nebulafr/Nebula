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

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  program: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  progress: number;
  lastSession?: string;
  nextSession?: string;
  totalSessions: number;
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
  const getStatusColor = (status: Student['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center space-x-4 p-4 animate-pulse">
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
        <p className="text-muted-foreground">No students found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Program</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Progress</TableHead>
          <TableHead>Last Session</TableHead>
          <TableHead>Sessions</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student.id}>
            <TableCell>
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={student.avatar} />
                  <AvatarFallback>
                    {student.name.split(' ').map(n => n[0]).join('')}
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
                {student.status}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-blue-600 rounded-full"
                    style={{ width: `${student.progress}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">
                  {student.progress}%
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                {student.lastSession || 'No sessions yet'}
              </div>
              {student.nextSession && (
                <div className="text-xs text-muted-foreground">
                  Next: {student.nextSession}
                </div>
              )}
            </TableCell>
            <TableCell>
              <div className="text-sm font-medium">
                {student.totalSessions}
              </div>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onMessageStudent?.(student.id)}
                >
                  <MessageSquare className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onScheduleSession?.(student.id)}
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
                    <DropdownMenuItem onClick={() => onViewProfile?.(student.id)}>
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onMessageStudent?.(student.id)}>
                      Send Message
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onScheduleSession?.(student.id)}>
                      Schedule Session
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onRemoveStudent?.(student.id)}
                      className="text-red-600"
                    >
                      Remove Student
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