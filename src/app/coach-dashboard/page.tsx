"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  MoreHorizontal,
  ArrowUpRight,
  Users,
  Calendar,
  Star,
} from "lucide-react";
import Link from "next/link";
import { CoachRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/context/auth-context";

const upcomingSessions = [
  {
    studentName: "Alex Thompson",
    studentAvatar: "https://i.pravatar.cc/40?u=alex",
    program: "Consulting, Associate Level",
    time: "4:00 PM",
  },
  {
    studentName: "Sarah K.",
    studentAvatar: "https://i.pravatar.cc/40?u=sarah",
    program: "MBA Admissions Coaching",
    time: "6:00 PM",
  },
];

export default function CoachDashboardPage() {
  const { profile } = useAuth();

  return (
    <CoachRoute>
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h3 className="text-3xl font-bold tracking-tight">
            Welcome back, {profile?.fullName || "Coach"}!
          </h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <span className="text-muted-foreground">$</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$4,231.89</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Students
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+23</div>
              <p className="text-xs text-muted-foreground">
                +5 from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sessions this month
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                +1 since last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Rating
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.9/5</div>
              <p className="text-xs text-muted-foreground">
                Consistent high performance
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Upcoming Sessions Today</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingSessions.map((session, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={session.studentAvatar} />
                            <AvatarFallback>
                              {session.studentName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {session.studentName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{session.program}</TableCell>
                      <TableCell>{session.time}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Join Call
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card className="col-span-4 lg:col-span-3">
            <CardHeader>
              <CardTitle>Recent Payouts</CardTitle>
              <CardDescription>You made 3 payouts this month.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src="https://i.pravatar.cc/40?u=payout1"
                      alt="Avatar"
                    />
                    <AvatarFallback>OM</AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      August Payout
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Bank Transfer
                    </p>
                  </div>
                  <div className="ml-auto font-medium">+$1,999.00</div>
                </div>
                <div className="flex items-center">
                  <Avatar className="flex h-9 w-9 items-center justify-center space-y-0 border">
                    <AvatarImage
                      src="https://i.pravatar.cc/40?u=payout2"
                      alt="Avatar"
                    />
                    <AvatarFallback>JL</AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      July Payout
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Bank Transfer
                    </p>
                  </div>
                  <div className="ml-auto font-medium">+$390.00</div>
                </div>
                <div className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src="https://i.pravatar.cc/40?u=payout3"
                      alt="Avatar"
                    />
                    <AvatarFallback>IN</AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      June Payout
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Bank Transfer
                    </p>
                  </div>
                  <div className="ml-auto font-medium">+$1,200.00</div>
                </div>
              </div>
              <Button asChild className="mt-6 w-full">
                <Link href="/coach-dashboard/payouts">View all payouts</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </CoachRoute>
  );
}
