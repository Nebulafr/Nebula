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
  ExternalLink,
  Calendar,
  Loader2,
  Briefcase,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useStudentSessions } from "@/hooks/use-session-queries";
import { getDefaultAvatar } from "@/lib/event-utils";
import {
  useActiveEnrollments,
  useCompletedEnrollments,
} from "@/hooks/use-enrollment-queries";

function SessionCard({
  session,
  isNext = false,
}: {
  session: any;
  isNext?: boolean;
}) {
  const sessionDate = new Date(session.scheduledTime);
  const currentTime = new Date();
  const isSessionPast = sessionDate < currentTime;

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
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6">
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

          <div className="md:col-span-1 grid grid-cols-3 gap-4 text-sm">
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
              <p className="text-muted-foreground font-semibold">Duration</p>
              <p>{session.duration} min</p>
            </div>
          </div>

          <div className="md:col-span-1 flex items-center justify-end gap-2">
            {!isSessionPast && (
              <Badge
                variant={session.status === "SCHEDULED" ? "default" : "secondary"}
                className="text-xs mr-2"
              >
                {session.status?.charAt(0) +
                  session.status?.slice(1).toLowerCase()}
              </Badge>
            )}
            {session.meetLink && session.status === "SCHEDULED" && !isSessionPast && (
              <Button asChild>
                <Link href={session.meetLink} target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Join Meeting
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProgramCard({ program }: { program: any }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <h3 className="font-bold text-lg">{program.title}</h3>
              <div className="flex items-center gap-2 mt-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={
                      program.coach.avatar ||
                      getDefaultAvatar(program.coach.name)
                    }
                  />
                  <AvatarFallback>
                    {program.coach.name?.charAt(0) || "C"}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm text-muted-foreground">
                  with {program.coach.name}
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href={`/programs/${program.slug}`}>
                Continue Program <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm text-muted-foreground">Progress</p>
              <p className="text-sm font-semibold">{program.progress}%</p>
            </div>
            <Progress value={program.progress} className="h-2" />
          </div>
          <Separator />
          <div>
            <h4 className="font-semibold text-muted-foreground mb-4">
              Sessions
            </h4>
            <ul className="space-y-3">
              {program.sessions.map((session: any, index: number) => (
                <li key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {session.status === "Completed" ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span
                      className={cn(
                        session.status === "Completed" &&
                          "text-muted-foreground line-through"
                      )}
                    >
                      {session.title}
                    </span>
                  </div>
                  {session.status === "Upcoming" ? (
                    <Button variant="secondary" size="sm">
                      <Computer className="mr-2 h-4 w-4" />
                      Join Meeting
                    </Button>
                  ) : (
                    <Badge
                      variant="secondary"
                      className={cn(
                        session.status === "Completed" &&
                          "bg-green-100 text-green-800"
                      )}
                    >
                      {session.status}
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
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

  // Fetch real session data
  const { data: upcomingSessionsData, isLoading: loadingUpcoming } =
    useStudentSessions("upcoming");
  const { data: completedSessionsData, isLoading: loadingCompleted } =
    useStudentSessions("past");

  // Fetch real enrollment data
  const { data: activeEnrollmentsData, isLoading: loadingActiveEnrollments } =
    useActiveEnrollments();
  const {
    data: completedEnrollmentsData,
    isLoading: loadingCompletedEnrollments,
  } = useCompletedEnrollments();

  const realUpcomingSessions = upcomingSessionsData?.data?.sessions || [];
  const realCompletedSessions = completedSessionsData?.data?.sessions || [];
  const activeEnrollments = activeEnrollmentsData?.data?.enrollments || [];
  const completedEnrollments =
    completedEnrollmentsData?.data?.enrollments || [];

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <Tabs defaultValue="individual" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-sm">
          <TabsTrigger value="individual">Individual sessions</TabsTrigger>
          <TabsTrigger value="group">My Programs</TabsTrigger>
        </TabsList>
        <TabsContent value="individual">
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-6">
              <Button
                variant={activeSubTab === "Upcoming" ? "secondary" : "outline"}
                onClick={() => setActiveSubTab("Upcoming")}
              >
                Upcoming
              </Button>
              <Button
                variant={activeSubTab === "Previous" ? "secondary" : "outline"}
                onClick={() => setActiveSubTab("Previous")}
              >
                Previous
              </Button>
            </div>
            {activeSubTab === "Upcoming" && (
              <div className="space-y-6">
                {loadingUpcoming ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="p-6">
                        <div className="animate-pulse flex items-center gap-4">
                          <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                          <div className="h-8 bg-gray-200 rounded w-24"></div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : realUpcomingSessions.length > 0 ? (
                  <div className="space-y-4">
                    {realUpcomingSessions.map((session: any, index: number) => (
                      <SessionCard
                        key={session.id || index}
                        session={session}
                        isNext={index === 0}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Upcoming Sessions
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      You don't have any sessions scheduled yet. Book a session
                      with one of our coaches to get started.
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
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="p-6">
                        <div className="animate-pulse flex items-center gap-4">
                          <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                          <div className="h-8 bg-gray-200 rounded w-24"></div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : realCompletedSessions.length > 0 ? (
                  <div className="space-y-4">
                    {realCompletedSessions.map(
                      (session: any, index: number) => (
                        <SessionCard
                          key={session.id || index}
                          session={session}
                        />
                      )
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16 text-muted-foreground">
                    <CheckCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Previous Sessions
                    </h3>
                    <p className="text-muted-foreground">
                      Your completed sessions will appear here.
                    </p>
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
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="p-6">
                        <div className="animate-pulse">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            </div>
                            <div className="h-8 bg-gray-200 rounded w-32"></div>
                          </div>
                          <div className="h-2 bg-gray-200 rounded mb-4"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : activeEnrollments.length > 0 ? (
                  activeEnrollments
                    .filter((program: any) =>
                      program.sessions.some((s: any) => s.status === "Upcoming")
                    )
                    .map((program: any, index: number) => (
                      <ProgramCard
                        key={program.id || index}
                        program={program}
                      />
                    ))
                ) : (
                  <div className="text-center py-16">
                    <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Active Programs
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      You're not currently enrolled in any programs. Browse our
                      catalog to get started.
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
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="p-6">
                        <div className="animate-pulse">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            </div>
                            <div className="h-8 bg-gray-200 rounded w-32"></div>
                          </div>
                          <div className="h-2 bg-gray-200 rounded mb-4"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : completedEnrollments.length > 0 ? (
                  completedEnrollments.map((program: any, index: number) => (
                    <ProgramCard key={program.id || index} program={program} />
                  ))
                ) : (
                  <div className="text-center py-16 text-muted-foreground">
                    <CheckCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Completed Programs
                    </h3>
                    <p className="text-muted-foreground">
                      Your completed programs will appear here.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
