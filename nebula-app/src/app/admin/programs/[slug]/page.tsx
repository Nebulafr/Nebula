"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Book,
  Presentation,
  StickyNote,
  File,
  Download,
  Calendar as CalendarIcon,
  Users,
  Loader2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useProgramBySlug, useUpdateProgramStatus } from "@/hooks";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { cn, apiGet, apiPatch, apiPost } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const getFileIcon = (type: string) => {
  if (type === "pdf") return <Book className="h-5 w-5 text-red-500" />;
  if (["ppt", "pptx"].includes(type))
    return <Presentation className="h-5 w-5 text-orange-500" />;
  if (["doc", "docx"].includes(type))
    return <StickyNote className="h-5 w-5 text-blue-500" />;
  return <File className="h-5 w-5 text-muted-foreground" />;
};

const getStatusBadgeVariant = (status: string) => {
  if (status === "ACTIVE") return "default";
  if (status === "PENDING_APPROVAL") return "secondary";
  if (status === "APPROVED") return "outline";
  if (status === "SUBMITTED") return "default";
  if (status === "REJECTED") return "destructive";
  if (status === "INACTIVE") return "outline";
  return "outline";
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING_APPROVAL: "Pending Approval",
    APPROVED: "Approved - Awaiting Coach",
    SUBMITTED: "Submitted - Ready to Publish",
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    REJECTED: "Rejected",
  };
  return labels[status] || status;
};

const getStatusMessage = (status: string) => {
  const messages: Record<string, string> = {
    PENDING_APPROVAL: "Review the program details and approve or reject.",
    APPROVED:
      "Collaboration document sent to coach. Waiting for coach to sign and submit.",
    SUBMITTED: "Coach has signed the collaboration document. Ready to publish.",
    ACTIVE: "Program is live and accepting enrollments.",
    INACTIVE: "Program is currently inactive and hidden from students.",
    REJECTED: "This program has been rejected.",
  };
  return messages[status] || "";
};

export default function ProgramDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: programResponse, isLoading } = useProgramBySlug(slug);
  const program = programResponse?.data?.program;
  const updateProgramStatusMutation = useUpdateProgramStatus();

  const [startDate, setStartDate] = useState<Date>();
  const [cohortDialogOpen, setCohortDialogOpen] = useState(false);
  const [editingCohort, setEditingCohort] = useState<any>(null);
  const [isCreatingCohort, setIsCreatingCohort] = useState(false);
  const [cohortForm, setCohortForm] = useState({
    name: "",
    startDate: "",
    startTime: "09:00",
    maxStudents: 30,
  });

  // Fetch cohorts for this program
  const { data: cohortsResponse, isLoading: isLoadingCohorts } = useQuery({
    queryKey: ["admin-cohorts", program?.id],
    queryFn: () => apiGet(`/admin/cohorts?programId=${program?.id}`),
    enabled: !!program?.id,
  });
  const cohorts = cohortsResponse?.data?.cohorts || [];

  // Update cohort mutation
  const updateCohortMutation = useMutation({
    mutationFn: async ({ cohortId, data }: { cohortId: string; data: any }) => {
      return apiPatch(`/admin/cohorts/${cohortId}`, data);
    },
    onSuccess: () => {
      toast.success("Cohort updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["admin-cohorts", program?.id],
      });
      setCohortDialogOpen(false);
      setEditingCohort(null);
    },
    onError: () => {
      toast.error("Failed to update cohort");
    },
  });

  // Create cohort mutation
  const createCohortMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiPost("/admin/cohorts", data);
    },
    onSuccess: () => {
      toast.success("Cohort created successfully");
      queryClient.invalidateQueries({
        queryKey: ["admin-cohorts", program?.id],
      });
      setCohortDialogOpen(false);
      setIsCreatingCohort(false);
    },
    onError: () => {
      toast.error("Failed to create cohort");
    },
  });

  const handleApprove = async () => {
    if (!startDate) {
      toast.error("Please select a start date for the program");
      return;
    }

    try {
      await updateProgramStatusMutation.mutateAsync({
        programId: program.id,
        action: "approve",
        startDate: startDate.toISOString(),
      });
      toast.success("Program approved. Collaboration document sent to coach.");
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleReject = async () => {
    try {
      await updateProgramStatusMutation.mutateAsync({
        programId: program.id,
        action: "reject",
      });
      router.push("/admin/programs");
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleActivate = async () => {
    try {
      await updateProgramStatusMutation.mutateAsync({
        programId: program.id,
        action: "activate",
      });
      toast.success("Program is now live!");
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDeactivate = async () => {
    try {
      await updateProgramStatusMutation.mutateAsync({
        programId: program.id,
        action: "deactivate",
      });
      toast.success("Program deactivated");
    } catch (error) {
      // Error handled by hook
    }
  };

  const openEditCohort = (cohort: any) => {
    setEditingCohort(cohort);
    setIsCreatingCohort(false);
    const startDateTime = new Date(cohort.startDate);
    setCohortForm({
      name: cohort.name || "",
      startDate: format(startDateTime, "yyyy-MM-dd"),
      startTime: format(startDateTime, "HH:mm"),
      maxStudents: cohort.maxStudents,
    });
    setCohortDialogOpen(true);
  };

  const openCreateCohort = () => {
    setEditingCohort(null);
    setIsCreatingCohort(true);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7);
    setCohortForm({
      name: "",
      startDate: format(tomorrow, "yyyy-MM-dd"),
      startTime: "09:00",
      maxStudents: program?.maxStudents || 30,
    });
    setCohortDialogOpen(true);
  };

  const handleSaveCohort = () => {
    const [hours, minutes] = cohortForm.startTime.split(":").map(Number);
    const startDateTime = new Date(cohortForm.startDate);
    startDateTime.setHours(hours, minutes);

    if (isCreatingCohort) {
      createCohortMutation.mutate({
        programId: program?.id,
        name: cohortForm.name || "New Cohort",
        startDate: startDateTime.toISOString(),
        maxStudents: cohortForm.maxStudents,
      });
    } else if (editingCohort) {
      updateCohortMutation.mutate({
        cohortId: editingCohort.id,
        data: {
          name: cohortForm.name,
          startDate: startDateTime.toISOString(),
          maxStudents: cohortForm.maxStudents,
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <p>Loading program details...</p>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-center py-12">
          <p>Program not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/admin/programs">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Programs
          </Link>
        </Button>
      </div>

      {/* Status Banner */}
      <Card
        className={cn(
          "border-l-4",
          program.status === "ACTIVE" &&
            "border-l-green-500 bg-green-50 dark:bg-green-950/20",
          program.status === "PENDING_APPROVAL" &&
            "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20",
          program.status === "APPROVED" &&
            "border-l-blue-500 bg-blue-50 dark:bg-blue-950/20",
          program.status === "SUBMITTED" &&
            "border-l-purple-500 bg-purple-50 dark:bg-purple-950/20",
          program.status === "REJECTED" &&
            "border-l-red-500 bg-red-50 dark:bg-red-950/20",
          program.status === "INACTIVE" &&
            "border-l-gray-500 bg-gray-50 dark:bg-gray-950/20",
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant={getStatusBadgeVariant(program.status)}>
                {getStatusLabel(program.status)}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {getStatusMessage(program.status)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* PENDING_APPROVAL: Show date picker + approve/reject */}
              {program.status === "PENDING_APPROVAL" && (
                <>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[240px] justify-start text-left font-normal",
                          !startDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate
                          ? format(startDate, "PPP 'at' p")
                          : "Select start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => {
                          if (date) {
                            const currentTime = startDate || new Date();
                            date.setHours(
                              currentTime.getHours(),
                              currentTime.getMinutes(),
                            );
                            setStartDate(date);
                          }
                        }}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                      <div className="p-3 border-t">
                        <Label className="text-sm font-medium">Time</Label>
                        <Input
                          type="time"
                          className="mt-2"
                          value={
                            startDate ? format(startDate, "HH:mm") : "09:00"
                          }
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value
                              .split(":")
                              .map(Number);
                            const newDate = startDate
                              ? new Date(startDate)
                              : new Date();
                            newDate.setHours(hours, minutes);
                            setStartDate(newDate);
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button
                    variant="outline"
                    onClick={handleReject}
                    disabled={updateProgramStatusMutation.isPending}
                  >
                    {updateProgramStatusMutation.isPending &&
                    updateProgramStatusMutation.variables?.action === "reject" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Reject
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={updateProgramStatusMutation.isPending}
                  >
                    {updateProgramStatusMutation.isPending &&
                    updateProgramStatusMutation.variables?.action === "approve" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Approve
                  </Button>
                </>
              )}

              {/* SUBMITTED: Show activate button */}
              {program.status === "SUBMITTED" && (
                <Button
                  onClick={handleActivate}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={updateProgramStatusMutation.isPending}
                >
                  {updateProgramStatusMutation.isPending &&
                  updateProgramStatusMutation.variables?.action === "activate" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Publish Program
                </Button>
              )}

              {/* ACTIVE: Show deactivate button */}
              {program.status === "ACTIVE" && (
                <Button
                  variant="outline"
                  onClick={handleDeactivate}
                  disabled={updateProgramStatusMutation.isPending}
                >
                  {updateProgramStatusMutation.isPending &&
                  updateProgramStatusMutation.variables?.action === "deactivate" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Deactivate
                </Button>
              )}

              {/* INACTIVE: Show reactivate button */}
              {program.status === "INACTIVE" && (
                <Button
                  onClick={handleActivate}
                  disabled={updateProgramStatusMutation.isPending}
                >
                  {updateProgramStatusMutation.isPending &&
                  updateProgramStatusMutation.variables?.action === "activate" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Reactivate
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cohorts Section - Show for approved/submitted/active programs */}
      {["APPROVED", "SUBMITTED", "ACTIVE", "INACTIVE"].includes(
        program.status,
      ) && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Program Cohorts
            </CardTitle>
            <Button size="sm" onClick={openCreateCohort}>
              Add Cohort
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingCohorts ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">
                  Loading cohorts...
                </span>
              </div>
            ) : cohorts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No cohorts found.</p>
            ) : (
              <div className="space-y-3">
                {cohorts.map((cohort: any) => (
                  <div
                    key={cohort.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {cohort.name || "Unnamed Cohort"}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {cohort.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {format(new Date(cohort.startDate), "PPP 'at' p")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {cohort._count?.enrollments || 0} /{" "}
                          {cohort.maxStudents} students
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditCohort(cohort)}
                    >
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-8">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <Label className="text-xs text-muted-foreground">
                  Program Title
                </Label>
                <h2 className="text-lg font-semibold">{program.title}</h2>
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">
                Description
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {program.description}
              </p>
            </div>
            <Separator />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">
                  Category
                </Label>
                <p className="font-medium">{program.category?.name}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Target Audience
                </Label>
                <p className="font-medium">
                  {program.targetAudience || "Not specified"}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Duration
                </Label>
                <p className="font-medium">{program.duration}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Difficulty Level
                </Label>
                <p className="font-medium">{program.difficultyLevel}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Price</Label>
                <p className="font-medium">${program.price}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Max Students
                </Label>
                <p className="font-medium">{program.maxStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-lg">Program Objectives</h3>
            <div className="space-y-2">
              {program.objectives?.map((obj: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">• {obj}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-lg">
              Program Modules & Materials
            </h3>
            <div className="space-y-6">
              {program.modules?.map((mod: any, i: number) => (
                <div key={i} className="p-4 rounded-md border">
                  <h4 className="font-semibold mb-1">
                    Week {mod.week}: {mod.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {mod.description}
                  </p>

                  {mod.materials && mod.materials.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-xs text-muted-foreground">
                        Uploaded Materials:
                      </h5>
                      {mod.materials.map((materialUrl: string, idx: number) => {
                        const fileName =
                          materialUrl.split("/").pop() || `Material ${idx + 1}`;
                        const decodedFileName = decodeURIComponent(
                          fileName.split("?")[0],
                        );
                        const extension =
                          decodedFileName.split(".").pop()?.toLowerCase() || "";
                        const downloadUrl = materialUrl.includes("cloudinary")
                          ? materialUrl.replace(
                              "/upload/",
                              "/upload/fl_attachment/",
                            )
                          : materialUrl;

                        return (
                          <a
                            key={idx}
                            href={downloadUrl}
                            download={decodedFileName}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              {getFileIcon(extension)}
                              <span className="text-xs">{decodedFileName}</span>
                            </div>
                            <Download className="h-3 w-3 text-muted-foreground" />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-lg">Coach Information</h3>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={program.coach?.user?.avatarUrl} />
                <AvatarFallback>
                  {program.coach?.user?.fullName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{program.coach?.user?.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  {program.coach?.user?.email}
                </p>
              </div>
              <Badge>Lead Coach</Badge>
            </div>
            {program.coCoaches && program.coCoaches.length > 0 && (
              <>
                <Separator />
                <h4 className="font-medium text-sm">Co-Coaches</h4>
                <div className="space-y-3">
                  {program.coCoaches.map((coCoach: any) => (
                    <div key={coCoach.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={coCoach.coach?.user?.avatarUrl} />
                        <AvatarFallback>
                          {coCoach.coach?.user?.fullName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {coCoach.coach?.user?.fullName}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {program.prerequisites && program.prerequisites.length > 0 && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">Prerequisites</h3>
              <div className="space-y-2">
                {program.prerequisites.map((prereq: string, i: number) => (
                  <p key={i} className="text-sm text-muted-foreground">
                    • {prereq}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {program.tags && program.tags.length > 0 && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {program.tags.map((tag: string, i: number) => (
                  <Badge key={i} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Cohort Dialog */}
      <Dialog open={cohortDialogOpen} onOpenChange={setCohortDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isCreatingCohort ? "Create Cohort" : "Edit Cohort"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cohort-name">Cohort Name</Label>
              <Input
                id="cohort-name"
                placeholder="e.g., Spring 2026 Cohort"
                value={cohortForm.name}
                onChange={(e) =>
                  setCohortForm({ ...cohortForm, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cohort-date">Start Date</Label>
                <Input
                  id="cohort-date"
                  type="date"
                  value={cohortForm.startDate}
                  onChange={(e) =>
                    setCohortForm({ ...cohortForm, startDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cohort-time">Start Time</Label>
                <Input
                  id="cohort-time"
                  type="time"
                  value={cohortForm.startTime}
                  onChange={(e) =>
                    setCohortForm({ ...cohortForm, startTime: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cohort-max">Max Students</Label>
              <Input
                id="cohort-max"
                type="number"
                value={cohortForm.maxStudents}
                onChange={(e) =>
                  setCohortForm({
                    ...cohortForm,
                    maxStudents: parseInt(e.target.value) || 30,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCohortDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCohort}
              disabled={updateCohortMutation.isPending || createCohortMutation.isPending}
            >
              {(updateCohortMutation.isPending || createCohortMutation.isPending) && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              {isCreatingCohort ? "Create Cohort" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
