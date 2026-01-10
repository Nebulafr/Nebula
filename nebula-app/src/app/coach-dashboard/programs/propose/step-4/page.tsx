"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  CheckCircle,
  File,
  Book,
  Presentation,
  StickyNote,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Stepper } from "../components/stepper";
import { useProposeProgramContext } from "../context/propose-program-context";
import { useCategories } from "@/hooks";

const getFileIcon = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (extension === "pdf") return <Book className="h-5 w-5 text-red-500" />;
  if (["ppt", "pptx"].includes(extension || ""))
    return <Presentation className="h-5 w-5 text-orange-500" />;
  if (["doc", "docx"].includes(extension || ""))
    return <StickyNote className="h-5 w-5 text-blue-500" />;
  return <File className="h-5 w-5 text-muted-foreground" />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function ProposeStep4Page() {
  const { formData, isStep2Valid } = useProposeProgramContext();
  const { data: categoriesResponse } = useCategories();
  const categories = (categoriesResponse as any)?.data?.categories || [];

  // Find category name by ID
  const getCategoryName = (categoryId: string) => {
    const cat = categories.find((c: any) => c.id === categoryId);
    return cat?.name || categoryId || "Not selected";
  };

  return (
    <Card className="w-full max-w-4xl shadow-lg">
      <CardContent className="p-8">
        <Stepper currentStep={4} />
        <div className="mt-12">
          <h1 className="text-3xl font-bold">Review and Submit</h1>
          <p className="mt-2 text-muted-foreground">
            Please review your program proposal carefully before submitting.
          </p>
        </div>

        <div className="space-y-8 mt-8">
          {/* Basic Info Card */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">
                {formData.title || "Untitled Program"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {formData.description || "No description provided"}
              </p>
              <Separator />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Career Track</p>
                  <p className="font-medium">
                    {getCategoryName(formData.category)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Target Audience</p>
                  <p className="font-medium">
                    {formData.targetAudience || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Price</p>
                  <p className="font-medium">
                    {formData.price ? `$${formData.price}` : "Free"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">
                    {formData.duration || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Difficulty</p>
                  <p className="font-medium capitalize">
                    {formData.difficultyLevel}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Max Students</p>
                  <p className="font-medium">{formData.maxStudents}</p>
                </div>
              </div>
              {formData.tags.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground text-sm mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {formData.prerequisites.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground text-sm mb-2">
                      Prerequisites
                    </p>
                    <ul className="list-disc list-inside text-sm">
                      {formData.prerequisites.map((prereq, i) => (
                        <li key={i}>{prereq}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Objectives Card */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">Program Objectives</h3>
              {formData.objectives.length > 0 ? (
                <ul className="space-y-3 list-disc list-inside">
                  {formData.objectives.map((obj, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      {obj}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No objectives defined
                </p>
              )}
            </CardContent>
          </Card>

          {/* Modules & Materials Card */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">
                Program Modules & Materials
              </h3>
              <div className="space-y-6">
                {formData.modules.map((mod, i) => (
                  <div key={i} className="p-4 rounded-md border">
                    <p className="font-semibold">
                      {mod.title || `Week ${mod.week}`}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {mod.description || "No description"}
                    </p>
                    {mod.materials.length > 0 ? (
                      <div className="space-y-2">
                        <h4 className="font-medium text-xs text-muted-foreground">
                          Uploaded Materials:
                        </h4>
                        {mod.materials.map((file, fileIdx) => (
                          <div
                            key={fileIdx}
                            className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
                          >
                            {getFileIcon(file.name)}
                            <span className="text-xs">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({formatFileSize(file.size)})
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        No materials uploaded for this module.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Coaches Card */}
          {formData.isMultiCoach && formData.coCoaches.length > 0 && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">Co-Coaches</h3>
                <div className="space-y-3">
                  {formData.coCoaches.map((coach) => (
                    <div key={coach.id} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={coach.avatar} />
                        <AvatarFallback>{coach.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{coach.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-between mt-12">
          <Button asChild size="lg" variant="outline">
            <Link href="/coach-dashboard/programs/propose/step-3">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Link>
          </Button>
          <Button size="lg" disabled={!isStep2Valid} asChild={isStep2Valid}>
            {isStep2Valid ? (
              <Link href="/coach-dashboard/programs/propose/step-5">
                Submit Application <CheckCircle className="ml-2 h-4 w-4" />
              </Link>
            ) : (
              <>
                Submit Application <CheckCircle className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
