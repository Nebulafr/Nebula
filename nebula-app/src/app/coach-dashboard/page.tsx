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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { cn, apiPost } from "@/lib/utils";
import { toast } from "react-toastify";
import {
  useCoachSessions,
  useCoachStats,
  useCancelSession,
  useApproveSession,
  useRejectSession,
} from "@/hooks/use-session-queries";
import { getDefaultAvatar } from "@/lib/event-utils";
import { useTranslations } from "next-intl";

function CoachDashboardContent() {
  const { profile } = useAuth();
  const searchParams = useSearchParams();
  const t = useTranslations("dashboard.coach");
  const td = useTranslations("dashboard");
  const tc = useTranslations("common");
  const { data: todaySessionsData, isLoading: isLoadingSessions } =
    useCoachSessions("upcoming");
  const { data: statsData } = useCoachStats();
  const { mutate: cancelSession, isPending: isCancelling } =
    useCancelSession();
  const { mutate: approveSession, isPending: isApproving } =
    useApproveSession();
  const { mutate: rejectSession, isPending: isRejecting } =
    useRejectSession();

  const handleApprove = (sessionId: string) => {
    approveSession(sessionId, {
      onSuccess: (result) => {
        if (result.success) {
          toast.success(t("sessionApproved"));
        }
      },
    });
  };

  const handleReject = (sessionId: string) => {
    rejectSession(sessionId, {
      onSuccess: (result) => {
        if (result.success) {
          toast.success(t("sessionRejected"));
        }
      },
    });
  };

  const handleCancel = (sessionId: string) => {
    cancelSession(
      { sessionId },
      {
        onSuccess: (result) => {
          if (result.success) {
            toast.success(t("sessionCancelled"));
          }
        },
      }
    );
  };

  const stats = statsData?.data;

  console.log({ todaySessionsData, statsData });

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
            // Google Calendar connected successfully
          } else {
            toast.error(
              result?.message || t("failedToSaveCalendar")
            );
          }
        } catch (error) {
          toast.error(t("failedToSaveCalendar"));
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
            {td("welcome", { name: profile?.fullName || t("coach") })}
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
                ? t("calendarConnected")
                : t("connectCalendar")}
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("totalRevenue")}
              </CardTitle>
              <span className="text-muted-foreground">$</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats?.totalRevenue || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("fromLastMonth", { change: stats?.revenueChange || 0 })}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("activeStudents")}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                +{stats?.activeStudents || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("sinceLastMonth", { count: stats?.studentsChange || 0 })}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("sessionsThisMonth")}
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.sessionsThisMonth || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("sinceLastMonth", { count: stats?.sessionsChange || 0 })}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("averageRating")}
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Number(stats?.averageRating || 0).toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("consistentPerformance")}
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>{t("upcomingSessionsToday")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                   <TableRow>
                    <TableHead>{t("student")}</TableHead>
                    <TableHead>{t("time")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead className="text-right">{t("payouts.actions")}</TableHead>
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
                                      session.students[0]?.avatarUrl ||
                                      getDefaultAvatar(
                                        session.students[0]?.fullName
                                      )
                                    }
                                  />
                                  <AvatarFallback>
                                    {session.students[0]?.fullName?.charAt(0) ||
                                      "S"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">
                                   {session.students[0]?.fullName || t("student")}
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
                          <Badge
                            variant={
                              session.status === "SCHEDULED"
                                ? "outline"
                                : "secondary"
                            }
                            className={cn(
                              session.status === "CANCELLED" &&
                                "bg-red-50 text-red-700 border-red-200"
                            )}
                          >
                            {td(`coach.schedule.sessionItem.status.${session.status}`)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {session.status === "REQUESTED" && (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleApprove(session.id)}
                                  disabled={isApproving}
                                >
                                  {isApproving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    t("approve")
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                  onClick={() => handleReject(session.id)}
                                  disabled={isRejecting}
                                >
                                  {isRejecting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    t("reject")
                                  )}
                                </Button>
                              </div>
                            )}

                            {session.status === "SCHEDULED" && (
                              <>
                                {session.meetLink ? (
                                  <Button variant="outline" size="sm" asChild>
                                    <Link href={session.meetLink} target="_blank">
                                      {t("joinCall")}
                                    </Link>
                                  </Button>
                                ) : (
                                  <Button variant="outline" size="sm" disabled>
                                    {t("noLink")}
                                  </Button>
                                )}

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      disabled={isCancelling}
                                    >
                                      {isCancelling ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        t("schedule.list.cancel")
                                      )}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        {t("schedule.sessionItem.actions.cancel")}
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to cancel this
                                        coaching session with{" "}
                                        {session.students[0]?.fullName}? This
                                        action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        {tc("cancel")}
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleCancel(session.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        {t("schedule.sessionItem.actions.cancel")}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {t("noSessionsToday")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card className="col-span-4 lg:col-span-3">
            <CardHeader>
              <CardTitle>{t("recentPayouts")}</CardTitle>
              <CardDescription>{t("payoutCount", { count: 3 })}</CardDescription>
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
                      {t("settings.payout.bankTransfer")}
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
                      {t("settings.payout.bankTransfer")}
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
                      {t("settings.payout.bankTransfer")}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">+$1,200.00</div>
                </div>
              </div>
              <Button asChild className="mt-6 w-full">
                <Link href="/coach-dashboard/payouts">{t("viewAllPayouts")}</Link>
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
