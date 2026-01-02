"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Users, Calendar, Star, CalendarPlus, Loader2 } from "lucide-react";
import Link from "next/link";
import { CoachRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

import { toast } from "react-toastify";
import { apiPost } from "@/lib/utils";
import { useCoachSessions } from "@/hooks/use-session-queries";
import { getDefaultAvatar } from "@/lib/event-utils";

function CoachDashboardContent() {
  const { profile } = useAuth();
  const searchParams = useSearchParams();
  const { data: todaySessionsData, isLoading: isLoadingSessions } =
    useCoachSessions("today");

  // Handle OAuth redirect tokens
  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");

    if (accessToken) {
      // Save tokens to database using apiPatch
      async function saveTokens() {
        try {
          const result = await apiPost("/coaches/google-calendar", {
            googleCalendarAccessToken: accessToken,
            googleCalendarRefreshToken: refreshToken,
          });

          if (result.success) {
            toast.success(
              result?.message || "Google Calendar connected successfully!"
            );
          } else {
            toast.error(
              result?.message || "Failed to save calendar connection"
            );
          }
        } catch (error) {
          toast.error("Failed to save calendar connection");
        }
      }
      saveTokens();

      // Clean up URL params
      const url = new URL(window.location.href);
      url.searchParams.delete("access_token");
      url.searchParams.delete("refresh_token");
      window.history.replaceState({}, "", url.pathname);
    }
  }, [searchParams]);

  return (
    <CoachRoute>
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h3 className="text-3xl font-bold tracking-tight">
            Welcome back, {profile?.fullName || "Coach"}!
          </h3>
          <Button
            asChild
            variant={
              profile?.coach?.googleCalendarAccessToken ? "outline" : "default"
            }
          >
            <Link href="/api/auth/google-calendar">
              <CalendarPlus className="mr-2 h-4 w-4" />
              {profile?.coach?.googleCalendarAccessToken
                ? "Calendar Connected"
                : "Connect Calendar"}
            </Link>
          </Button>
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
                    <TableHead>Time</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingSessions ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : todaySessionsData?.data?.sessions?.length > 0 ? (
                    todaySessionsData?.data?.sessions?.map((session: any) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {
                              <>
                                <Avatar>
                                  <AvatarImage
                                    src={
                                      session.students[0].avatarUrl ||
                                      getDefaultAvatar(
                                        session.students[0]?.fullName
                                      )
                                    }
                                  />
                                  <AvatarFallback>
                                    {session.students[0].fullName?.charAt(0) ||
                                      "S"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">
                                  {session.students[0].fullName || "Student"}
                                </span>
                              </>
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(session.scheduledTime).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </TableCell>
                        <TableCell>
                          {session.meetLink ? (
                            <Button variant="outline" size="sm" asChild>
                              <Link href={session.meetLink} target="_blank">
                                Join Call
                              </Link>
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" disabled>
                              No Link
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No sessions scheduled for today
                      </TableCell>
                    </TableRow>
                  )}
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

export default function CoachDashboardPage() {
  return (
    <Suspense
      fallback={
        <CoachRoute>
          <div className="flex-1 space-y-4 p-4 md:p-8">
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            </div>
          </div>
        </CoachRoute>
      }
    >
      <CoachDashboardContent />
    </Suspense>
  );
}
