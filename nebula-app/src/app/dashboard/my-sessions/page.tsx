/* eslint-disable */
"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Computer,
  ArrowRight,
  CheckCircle,
  Download,
  BookOpen,
  Video,
  FileText,
  File,
  Calendar,
  Loader2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { MaterialLink } from "@/components/MaterialLink";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  useStudentSessions,
  useCancelSession,
} from "@/hooks/use-session-queries";
import { getDefaultAvatar } from "@/lib/event-utils";
import {
  useActiveEnrollments,
  useCompletedEnrollments,
} from "@/hooks/use-enrollment-queries";
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
import { toast } from "react-toastify";
import { StudentSession, EnrollmentWithRelations, ProgramWithRelations } from "@/types";

type EnrolledProgramMaterial = {
  id: string;
  url: string;
  name?: string;
  fileName?: string;
  fileType?: string;
  type?: string;
  fileSize?: number;
};

type EnrolledProgramModule = {
  title: string;
  description?: string;
  status?: "Completed" | "Upcoming" | "In Progress";
  materials?: EnrolledProgramMaterial[];
  nextSession?: {
    date: string;
    time: string;
    meetLink?: string;
  };
};

type EnrolledProgram = ProgramWithRelations & {
  progress: number;
  enrollmentDate: string;
  completionDate?: string;
  coach: {
    fullName?: string;
    avatarUrl?: string;
    name?: string;
  };
  objectives?: string[]; // Adding as optional since it's used in the UI
  modules?: EnrolledProgramModule[];
};

function SessionCard({
  session,
  isNext = false,
}: {
  session: StudentSession;
  isNext?: boolean;
}) {
  const sessionDate = new Date(session.scheduledTime);
  const currentTime = new Date();
  const isSessionPast = sessionDate < currentTime;

  const { mutate: cancelSession, isPending: isCancelling } =
    useCancelSession();

  const handleCancel = () => {
    cancelSession(
      { sessionId: session.id },
      {
        onSuccess: (result) => {
          if (result.success) {
            toast.success("Session cancelled successfully");
          }
        },
      }
    );
  };

  return (
    <Card
      className={cn("relative overflow-hidden", isNext && "border-primary")}
    >
      {isNext && (
        <div className="absolute top-0 left-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-br-lg">
          Next
        </div>
      )}
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-6">
          <div className="md:col-span-1 flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={
                  session.coach?.avatarUrl ||
                  getDefaultAvatar(session.coach?.fullName)
                }
              />
              <AvatarFallback>
                {session.coach?.fullName?.charAt(0) || "C"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-lg">
                {session.coach?.fullName || "Unknown Coach"}
              </h3>
              <Badge variant="outline">
                {session.title || "1-on-1 Session"}
              </Badge>
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground font-semibold">Time</p>
              <p>
                {sessionDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground font-semibold">Date</p>
              <p>{sessionDate.toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-semibold">Status</p>
              <Badge
                variant={
                  session.status === "SCHEDULED" ? "outline" : "secondary"
                }
                className={cn(
                  session.status === "CANCELLED" &&
                  "bg-red-50 text-red-700 border-red-200"
                )}
              >
                {session.status?.charAt(0) +
                  session.status?.slice(1).toLowerCase()}
              </Badge>
            </div>
          </div>

          <div className="md:col-span-1 flex flex-col sm:flex-row items-center justify-end gap-2">
            {!isSessionPast &&
              session.status === "SCHEDULED" &&
              session.meetLink && (
                <Button asChild className="w-full sm:w-auto">
                  <Link href={session.meetLink} target="_blank">
                    <Computer className="mr-2 h-4 w-4" />
                    Join
                  </Link>
                </Button>
              )}

            {!isSessionPast && session.status === "SCHEDULED" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Cancel"
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Session</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel this coaching session
                      with {session.coach?.fullName}? This action cannot be
                      undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Session</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancel}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Yes, Cancel Session
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {isSessionPast && session.status !== "CANCELLED" && (
              <Badge variant="secondary">Completed</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const CircularProgress = ({
  progress,
  size = 60,
  strokeWidth = 4,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      className="relative flex-shrink-0"
      style={{ height: size, width: size }}
    >
      <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="text-muted/20"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-primary"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.3s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-base font-bold">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};
function UpcomingProgramCard({ program }: { program: EnrolledProgram }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-6">
            <div className="flex-1">
              <h3 className="font-bold text-lg">{program.title}</h3>
              <div className="flex items-center gap-2 mt-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={
                      program.coach?.avatarUrl ||
                      getDefaultAvatar(program.coach?.fullName)
                    }
                  />
                  <AvatarFallback>
                    {program.coach?.fullName?.charAt(0) || "C"}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm text-muted-foreground">
                  with{" "}
                  {program.coach?.fullName ||
                    program.coach?.name ||
                    "Unknown Coach"}
                </p>
              </div>
            </div>
            <Link href={`/programs/${program.slug}`}>
              <Button>
                View Program Details <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-4 rounded-lg border p-4">
            <CircularProgress progress={program.progress} />
            <div>
              <p className="font-semibold">Your Progress</p>
              <p className="text-sm text-muted-foreground">
                You've completed {Math.round(program.progress)}% of the program.
              </p>
            </div>
          </div>
          <Separator />

          <Accordion type="multiple" className="w-full space-y-4">
            <Card className="p-0">
              <AccordionItem value="objectives" className="border-none">
                <AccordionTrigger className="p-4 font-semibold text-base hover:no-underline">
                  Learning Objectives
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <ul className="space-y-3 list-disc list-inside text-muted-foreground">
                    {program.objectives?.length > 0 ? (
                      program.objectives.map((obj: string, i: number) => (
                        <li key={i}>{obj}</li>
                      ))
                    ) : (
                      <li>Master the core concepts of this program.</li>
                    )}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Card>

            <Card className="p-0">
              <AccordionItem value="modules" className="border-none">
                <AccordionTrigger className="p-4 font-semibold text-base hover:no-underline">
                  Program Modules
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-4">
                  <Accordion type="multiple" className="w-full space-y-2">
                    {program.modules?.map((module: EnrolledProgramModule, i: number) => (
                      <Card key={i} className="bg-muted/50">
                        <AccordionItem
                          value={`module-${i}`}
                          className="border-none"
                        >
                          <AccordionTrigger className="p-3 font-medium hover:no-underline">
                            <div className="flex items-center gap-3">
                              {module.status === "Completed" ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <Clock className="h-5 w-5 text-muted-foreground" />
                              )}
                              <span
                                className={cn(
                                  module.status === "Completed" &&
                                  "text-muted-foreground line-through",
                                )}
                              >
                                {module.title}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-3 pb-3">
                            <p className="text-sm text-muted-foreground mb-4">
                              {module.description}
                            </p>
                            {(module.materials?.length ?? 0) > 0 && (
                              <div className="mb-4">
                                <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                                  Materials
                                </h4>
                                <div className="space-y-2">
                                  {module.materials?.map(
                                    (mat: EnrolledProgramMaterial, idx: number) => (
                                      <MaterialLink
                                        key={idx}
                                        material={mat}
                                      />
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                            {module.nextSession && (
                              <div>
                                <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                                  Next Session
                                </h4>
                                <div className="flex items-center justify-between p-3 rounded-md border bg-background">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                      {new Date(
                                        module.nextSession.date,
                                      ).toLocaleDateString()}{" "}
                                      at {module.nextSession.time}
                                    </span>
                                  </div>
                                  <Button size="sm" asChild>
                                    <Link
                                      href={module.nextSession.meetLink || "#"}
                                      target="_blank"
                                    >
                                      <Computer className="mr-2 h-4 w-4" />
                                      Join Meeting
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      </Card>
                    ))}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            </Card>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}
function CompletedProgramCard({ program }: { program: EnrolledProgram }) {
  return (
    <Card className="bg-muted/50">
      <CardContent className="p-6">
        <div className="grid md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <h3 className="font-bold text-lg">{program.title}</h3>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={
                    program.coach?.avatarUrl ||
                    getDefaultAvatar(program.coach?.fullName)
                  }
                />
                <AvatarFallback>
                  {program.coach?.fullName?.charAt(0) || "C"}
                </AvatarFallback>
              </Avatar>
              <span>with {program.coach?.fullName || program.coach?.name}</span>
            </div>
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <span>
                Enrolled:{" "}
                {new Date(program.enrollmentDate).toLocaleDateString()}
              </span>
              {program.completionDate && (
                <span>
                  Completed:{" "}
                  {new Date(program.completionDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          <div className="md:col-span-1 flex justify-start md:justify-end">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Completion Certificate
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MySessionsPage() {
  const [activeSubTab, setActiveSubTab] = React.useState("Upcoming");
  const [activeProgramSubTab, setActiveProgramSubTab] =
    React.useState("Upcoming");

  // Fetch real data
  const { data: upcomingSessionsData, isLoading: loadingUpcoming } =
    useStudentSessions("upcoming");
  const { data: completedSessionsData, isLoading: loadingCompleted } =
    useStudentSessions("past");

  const { data: activeEnrollmentsData, isLoading: loadingActiveEnrollments } =
    useActiveEnrollments();
  const {
    data: completedEnrollmentsData,
    isLoading: loadingCompletedEnrollments,
  } = useCompletedEnrollments();

  const activeEnrollments = activeEnrollmentsData?.enrollments || [];
  const completedEnrollments =
    completedEnrollmentsData?.enrollments || [];

  const realUpcomingSessions = upcomingSessionsData?.sessions || [];
  const realCompletedSessions = completedSessionsData?.sessions || [];

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <div className="container mx-auto max-w-5xl">
        <Tabs defaultValue="individual" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-sm">
            <TabsTrigger value="individual">Individual sessions</TabsTrigger>
            <TabsTrigger value="group">My Programs</TabsTrigger>
          </TabsList>

          <TabsContent value="individual">
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-6">
                <Button
                  variant={
                    activeSubTab === "Upcoming" ? "secondary" : "outline"
                  }
                  onClick={() => setActiveSubTab("Upcoming")}
                >
                  Upcoming
                </Button>
                <Button
                  variant={
                    activeSubTab === "Previous" ? "secondary" : "outline"
                  }
                  onClick={() => setActiveSubTab("Previous")}
                >
                  Previous
                </Button>
              </div>

              {activeSubTab === "Upcoming" && (
                <div className="space-y-6">
                  {loadingUpcoming ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Card key={i} className="p-6">
                          <div className="animate-pulse flex items-center gap-4">
                            <div className="h-16 w-16 bg-muted rounded-full" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-muted rounded w-1/4" />
                              <div className="h-4 bg-muted rounded w-1/2" />
                            </div>
                            <div className="h-10 bg-muted rounded w-32" />
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : realUpcomingSessions.length > 0 ? (
                    <div className="space-y-4">
                      {realUpcomingSessions.map(
                        (session: StudentSession, index: number) => (
                          <SessionCard
                            key={session.id || index}
                            session={session}
                            isNext={index === 0}
                          />
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">
                        No Upcoming Sessions
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        You don't have any sessions scheduled yet.
                      </p>
                      <Button asChild>
                        <Link href="/coaches">Browse Coaches</Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {activeSubTab === "Previous" && (
                <div className="space-y-6">
                  {loadingCompleted ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Card key={i} className="p-6">
                          <div className="animate-pulse flex items-center gap-4">
                            <div className="h-16 w-16 bg-muted rounded-full" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-muted rounded w-1/4" />
                              <div className="h-4 bg-muted rounded w-1/2" />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : realCompletedSessions.length > 0 ? (
                    <div className="space-y-4">
                      {realCompletedSessions.map(
                        (session: StudentSession, index: number) => (
                          <SessionCard
                            key={session.id || index}
                            session={session}
                          />
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-16 text-muted-foreground">
                      <CheckCircle className="h-16 w-16 mx-auto mb-4" />
                      <p>No previous sessions.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="group">
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-6">
                <Button
                  variant={
                    activeProgramSubTab === "Upcoming" ? "secondary" : "outline"
                  }
                  onClick={() => setActiveProgramSubTab("Upcoming")}
                >
                  Upcoming
                </Button>
                <Button
                  variant={
                    activeProgramSubTab === "Previous" ? "secondary" : "outline"
                  }
                  onClick={() => setActiveProgramSubTab("Previous")}
                >
                  Previous
                </Button>
              </div>

              {activeProgramSubTab === "Upcoming" && (
                <div className="space-y-4">
                  {loadingActiveEnrollments ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <Card key={i} className="p-6 animate-pulse">
                          <div className="h-6 w-1/3 bg-muted rounded mb-4" />
                          <div className="h-20 bg-muted rounded mb-4" />
                        </Card>
                      ))}
                    </div>
                  ) : activeEnrollments.length > 0 ? (
                    activeEnrollments.map((enrollment: EnrollmentWithRelations, index: number) => (
                      <UpcomingProgramCard
                        key={enrollment.id || index}
                        program={{
                          ...enrollment.program,
                          progress: enrollment.progress,
                          enrollmentDate: enrollment.enrollmentDate,
                          coach: enrollment.coach?.user as any || enrollment.coach as any,
                        }}
                      />
                    ))
                  ) : (
                    <div className="text-center py-16">
                      <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">
                        No Active Programs
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        You're not currently enrolled in any programs.
                      </p>
                      <Button asChild>
                        <Link href="/programs">Browse Programs</Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {activeProgramSubTab === "Previous" && (
                <div className="space-y-4">
                  {loadingCompletedEnrollments ? (
                    <div className="space-y-4">
                      <Card className="p-6 animate-pulse h-24 bg-muted" />
                    </div>
                  ) : completedEnrollments.length > 0 ? (
                    completedEnrollments.map(
                      (enrollment: EnrollmentWithRelations, index: number) => (
                        <CompletedProgramCard
                          key={enrollment.id || index}
                          program={{
                            ...enrollment.program,
                            enrollmentDate: enrollment.enrollmentDate,
                            completionDate: enrollment.completionDate,
                            coach: enrollment.coach?.user as any || enrollment.coach as any,
                          } as any}
                        />
                      ),
                    )
                  ) : (
                    <div className="text-center py-16 text-muted-foreground">
                      <CheckCircle className="h-16 w-16 mx-auto mb-4" />
                      <p>No previously completed programs.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
