"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Stepper } from "../components/stepper";
import { useProposeProgramContext } from "../context/propose-program-context";

import { useTranslations } from "next-intl";

export default function ProposeStep1Page() {
  const t = useTranslations("dashboard.coach.programs.proposeFlow.step1");
  const { formData, updateAcknowledgments, isStep1Valid } =
    useProposeProgramContext();

  const CONDITIONS = [
    {
      key: "isExpert" as const,
      label: t("condition1"),
    },
    {
      key: "canCommit" as const,
      label: t("condition2"),
    },
    {
      key: "isOriginal" as const,
      label: t("condition3"),
    },
  ];

  return (
    <Card className="w-full max-w-4xl shadow-lg">
      <CardContent className="p-8">
        <Stepper currentStep={1} />
        <div className="text-center mt-12">
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="mt-2 text-muted-foreground max-w-3xl mx-auto">
            {t("description")}
          </p>
        </div>

        <Card className="mt-8 bg-muted/50 border-dashed">
          <CardContent className="p-6">
            <h3 className="font-semibold text-center mb-6">
              {t("conditions")}
            </h3>
            <div className="space-y-4">
              {CONDITIONS.map((condition) => (
                <div
                  key={condition.key}
                  className="flex items-start space-x-3 rounded-md border p-4 bg-background"
                >
                  <Checkbox
                    id={condition.key}
                    checked={formData.acknowledgments[condition.key]}
                    onCheckedChange={() => updateAcknowledgments(condition.key)}
                  />
                  <Label
                    htmlFor={condition.key}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {condition.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between mt-12">
          <Button asChild variant="outline" size="lg">
            <Link href="/coach-dashboard/programs">{t("cancel")}</Link>
          </Button>
          <Button asChild size="lg" disabled={!isStep1Valid}>
            <Link
              href={
                isStep1Valid ? "/coach-dashboard/programs/propose/step-2" : "#"
              }
            >
              {t("next")} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
