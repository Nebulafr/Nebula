"use client";
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
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB in bytes
const MAX_FILES_PER_MODULE = 2;

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
  const t = useTranslations(
    "dashboard.coach.programs.proposeFlow.step3.uploader",
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const remainingSlots = MAX_FILES_PER_MODULE - files.length;

      if (remainingSlots <= 0) {
        toast.error(t("maxDocs", { count: MAX_FILES_PER_MODULE }));
        return;
      }

      const invalidFiles = acceptedFiles.filter(
        (file) => file.size > MAX_FILE_SIZE,
      );

      if (invalidFiles.length > 0) {
        toast.error(
          t("fileSizeLimit", {
            files: invalidFiles.map((f) => f.name).join(", "),
          }),
        );
        return;
      }

      const filesToAdd = acceptedFiles.slice(0, remainingSlots);

      if (filesToAdd.length < acceptedFiles.length) {
        toast.warning(
          t("onlySomeAdded", {
            count: remainingSlots,
            max: MAX_FILES_PER_MODULE,
          }),
        );
      }

      onDrop(filesToAdd);
    },
    maxSize: MAX_FILE_SIZE,
  });

  const remainingSlots = MAX_FILES_PER_MODULE - files.length;
  const isMaxReached = remainingSlots <= 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-muted-foreground">
          {t("docsCount", { count: files.length, max: MAX_FILES_PER_MODULE })}
        </p>
        <p className="text-xs text-muted-foreground">{t("maxSize")}</p>
      </div>
      <div
        {...getRootProps()}
        className={cn(
          "mt-4 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg",
          isMaxReached
            ? "cursor-not-allowed opacity-50 bg-muted"
            : "cursor-pointer",
          isDragActive && !isMaxReached
            ? "border-primary bg-primary/10"
            : "bg-muted hover:bg-muted/50",
        )}
      >
        <input {...getInputProps()} disabled={isMaxReached} />
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
          <p className="mb-2 text-sm text-muted-foreground">
            {isMaxReached ? (
              <span>{t("maxReached")}</span>
            ) : (
              <>
                <span className="font-semibold">{t("clickToUpload")}</span>{" "}
                {t("dragAndDrop")}
              </>
            )}
          </p>
          {!isMaxReached && (
            <p className="text-xs text-muted-foreground">
              {t("supportedTypes")}
            </p>
          )}
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => {
            const sizeInMB = file.size / (1024 * 1024);
            const sizeDisplay =
              sizeInMB >= 1
                ? `${sizeInMB.toFixed(2)} MB`
                : `${(file.size / 1024).toFixed(2)} KB`;

            return (
              <Card key={index} className="p-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.name)}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {sizeDisplay}
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
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ProposeStep3Page() {
  const t = useTranslations("dashboard.coach.programs.proposeFlow.step3");
  const { formData, addModuleMaterial, removeModuleMaterial } =
    useProposeProgramContext();

  return (
    <Card className="w-full max-w-4xl shadow-lg">
      <CardContent className="p-8">
        <Stepper currentStep={3} />
        <div className="mt-12">
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("description")}</p>
        </div>

        <div className="mt-8">
          {formData.modules.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">
              <p>{t("noModules")}</p>
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
                    {module.title || t("weekLabel", { count: index + 1 })}
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
              <ArrowLeft className="mr-2 h-4 w-4" /> {t("back")}
            </Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/coach-dashboard/programs/propose/step-4">
              {t("next")} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
