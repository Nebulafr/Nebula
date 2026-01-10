"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  File,
  X,
  Book,
  Presentation,
  StickyNote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Stepper } from "../components/stepper";
import { useProposeProgramContext } from "../context/propose-program-context";

const getFileIcon = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (extension === "pdf") return <Book className="h-5 w-5 text-red-500" />;
  if (["ppt", "pptx"].includes(extension || ""))
    return <Presentation className="h-5 w-5 text-orange-500" />;
  if (["doc", "docx"].includes(extension || ""))
    return <StickyNote className="h-5 w-5 text-blue-500" />;
  return <File className="h-5 w-5 text-muted-foreground" />;
};

interface ModuleUploaderProps {
  moduleIndex: number;
  files: File[];
  onDrop: (files: File[]) => void;
  onRemove: (file: File) => void;
}

function ModuleUploader({
  moduleIndex,
  files,
  onDrop,
  onRemove,
}: ModuleUploaderProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => onDrop(acceptedFiles),
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          "mt-4 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer",
          isDragActive
            ? "border-primary bg-primary/10"
            : "bg-muted hover:bg-muted/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
          <p className="mb-2 text-sm text-muted-foreground">
            <span className="font-semibold">Click to upload</span> or drag and
            drop
          </p>
          <p className="text-xs text-muted-foreground">PDF, PPT, DOC, etc.</p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <Card key={index} className="p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getFileIcon(file.name)}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(file)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProposeStep3Page() {
  const { formData, addModuleMaterial, removeModuleMaterial } =
    useProposeProgramContext();

  return (
    <Card className="w-full max-w-4xl shadow-lg">
      <CardContent className="p-8">
        <Stepper currentStep={3} />
        <div className="mt-12">
          <h1 className="text-3xl font-bold">Program Materials</h1>
          <p className="mt-2 text-muted-foreground">
            Upload any documents, slides, templates, or other resources for each
            module of your program. (Optional)
          </p>
        </div>

        <div className="mt-8">
          {formData.modules.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">
              <p>
                No modules defined yet. Please go back to Step 2 to add modules.
              </p>
            </Card>
          ) : (
            <Accordion
              type="single"
              collapsible
              className="w-full"
              defaultValue="item-0"
            >
              {formData.modules.map((module, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="font-semibold text-lg hover:no-underline">
                    {module.title || `Week ${module.week}`}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      {module.description}
                    </p>
                    <ModuleUploader
                      moduleIndex={index}
                      files={module.materials}
                      onDrop={(files) => addModuleMaterial(index, files)}
                      onRemove={(file) => removeModuleMaterial(index, file)}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>

        <div className="flex justify-between mt-12">
          <Button asChild size="lg" variant="outline">
            <Link href="/coach-dashboard/programs/propose/step-2">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/coach-dashboard/programs/propose/step-4">
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
