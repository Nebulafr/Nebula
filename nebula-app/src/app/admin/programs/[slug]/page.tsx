"use client";

import React, { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Book,
  Presentation,
  StickyNote,
  Trash2,
  PlusCircle,
  User,
  Upload,
  Edit,
  File,
  Download,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProgramBySlug, useUpdateProgramStatus } from "@/hooks";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

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
  if (status === "REJECTED") return "destructive";
  return "outline";
};

const getStatusLabel = (status: string) => {
  if (status === "PENDING_APPROVAL") return "Pending Approval";
  if (status === "ACTIVE") return "Active";
  if (status === "INACTIVE") return "Inactive";
  if (status === "REJECTED") return "Rejected";
  return status;
};

export default function ProgramDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { data: programResponse, isLoading } = useProgramBySlug(slug);
  const program = programResponse?.data?.program;
  const updateProgramStatusMutation = useUpdateProgramStatus();

  const handleApprove = async () => {
    try {
      await updateProgramStatusMutation.mutateAsync({
        programId: program.id,
        action: "approve",
      });
      toast.success("Program approved successfully");
      router.push("/admin/programs");
    } catch (error) {
      toast.error("Failed to approve program");
    }
  };

  const handleReject = async () => {
    try {
      await updateProgramStatusMutation.mutateAsync({
        programId: program.id,
        action: "reject",
      });
      toast.success("Program rejected successfully");
      router.push("/admin/programs");
    } catch (error) {
      toast.error("Failed to reject program");
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-center py-12">
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
        <div className="flex items-center gap-2">
          {program.status === "PENDING_APPROVAL" && (
            <>
              <Button variant="outline" onClick={handleReject}>
                Reject
              </Button>
              <Button onClick={handleApprove}>Approve & Publish</Button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-8 mt-8">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <Label
                  htmlFor="program-title"
                  className="text-xs text-muted-foreground"
                >
                  Program Title
                </Label>
                <Input
                  id="program-title"
                  defaultValue={program.title}
                  className="text-lg font-semibold border-0 p-0 h-auto focus-visible:ring-0"
                  readOnly
                />
              </div>
              <Badge variant={getStatusBadgeVariant(program.status)}>
                {getStatusLabel(program.status)}
              </Badge>
            </div>

            <div>
              <Label
                htmlFor="program-description"
                className="text-xs text-muted-foreground"
              >
                Description
              </Label>
              <Textarea
                id="program-description"
                defaultValue={program.description}
                className="text-sm text-muted-foreground border-0 p-0 h-auto focus-visible:ring-0"
                readOnly
              />
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4 text-sm">
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
                  <h4 className="font-semibold mb-1">{mod.title}</h4>
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
                          fileName.split("?")[0]
                        );
                        const extension =
                          decodedFileName.split(".").pop()?.toLowerCase() || "";

                        return (
                          <a
                            key={idx}
                            href={materialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                            download
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

        {program.status === "PENDING_APPROVAL" && (
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleReject}>
              Reject
            </Button>
            <Button onClick={handleApprove}>Approve & Publish</Button>
          </div>
        )}
      </div>
    </div>
  );
}
