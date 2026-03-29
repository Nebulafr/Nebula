"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Briefcase, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface ProgramsSectionProps {
    coach: any;
}

export function ProgramsSection({ coach }: ProgramsSectionProps) {
    const t = useTranslations("coachDetails");
    if (!coach.programs || coach.programs.length === 0) return null;

    return (
        <div className="my-16">
            <div className="mb-6">
                <h2 className="font-headline text-2xl font-bold">
                    {t("programsBy", { name: coach.fullName })}
                </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {coach.programs.map((program: any) => (
                    <Link
                        href={
                            program.slug.startsWith("/")
                                ? program.slug
                                : `/programs/${program.slug}`
                        }
                        key={program.id}
                    >
                        <Card className="p-6 flex items-center gap-4 hover:shadow-lg transition-shadow border-muted bg-card h-full">
                            <div
                                className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0",
                                    program.category === "Career Prep"
                                        ? "bg-primary/10"
                                        : "bg-blue-500/10"
                                )}
                            >
                                {program.category === "Career Prep" ? (
                                    <Briefcase className="h-5 w-5 text-primary" />
                                ) : (
                                    <GraduationCap className="h-5 w-5 text-blue-500" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-headline font-semibold text-sm leading-tight">
                                    {program.title}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {program.category}
                                </p>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
