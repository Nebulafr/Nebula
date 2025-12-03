"use client";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatUserName, getUserInitials } from "@/lib/chat-utils";

interface User {
  name: string;
  email: string;
  avatar?: string;
  role: string;
  status: string;
  joined?: string;
}

interface UsersTableProps {
  users: User[];
  loading?: boolean;
  onUserAction?: (user: User, action: string) => void;
}

function getUserStatusVariant(status: string) {
  switch (status.toLowerCase()) {
    case 'active':
      return 'secondary';
    case 'suspended':
      return 'destructive';
    default:
      return 'outline';
  }
}

function getUserStatusClassName(status: string) {
  return status.toLowerCase() === 'active' ? 'bg-green-100 text-green-800' : '';
}

export function UsersTable({ users, loading = false, onUserAction }: UsersTableProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>A list of all the users in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
                      <div>
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1" />
                        <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User List</CardTitle>
        <CardDescription>A list of all the users in the system.</CardDescription>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p>No users found matching your criteria.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const displayName = formatUserName(user.name);
                const initials = getUserInitials(user.name);
                
                return (
                  <TableRow key={user.email}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-medium">{displayName}</span>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={getUserStatusVariant(user.status)} 
                        className={getUserStatusClassName(user.status)}
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.joined}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => onUserAction?.(user, 'edit')}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUserAction?.(user, 'suspend')}>
                            {user.status === 'Active' ? 'Suspend' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => onUserAction?.(user, 'delete')}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}