"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import Link from "next/link";
import { formatUserName, getUserInitials } from "@/lib/chat-utils";

interface RecentSignup {
  name: string;
  email: string;
  avatar?: string;
  role: string;
  joined?: string;
}

interface RecentSignupsProps {
  signups: RecentSignup[];
  loading?: boolean;
  onUserAction?: (user: RecentSignup, action: string) => void;
}

export function RecentSignups({ 
  signups, 
  loading = false, 
  onUserAction 
}: RecentSignupsProps) {
  if (loading) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Recent Sign-ups</CardTitle>
          <CardDescription>A list of the newest users on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((i) => (
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
                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                  <TableCell className="text-right">
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
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Recent Sign-ups</CardTitle>
        <CardDescription>A list of the newest users on the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        {signups.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p>No recent sign-ups to display.</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signups.map((user, index) => {
                  const displayName = formatUserName(user.name);
                  const initials = getUserInitials(user.name);
                  
                  return (
                    <TableRow key={index}>
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
                      <TableCell>
                        <Badge variant={user.role.toLowerCase() === 'coach' ? 'secondary' : 'outline'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onUserAction?.(user, 'view')}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <Button asChild className="mt-6 w-full">
              <Link href="/admin/users">View all users</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}