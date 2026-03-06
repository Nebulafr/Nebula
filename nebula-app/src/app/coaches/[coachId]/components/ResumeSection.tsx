"use client";

import { useTranslations } from "next-intl";

interface ResumeSectionProps {
    experienceList: any[];
}

export function ResumeSection({ experienceList }: ResumeSectionProps) {
    const t = useTranslations("coachDetails");
    if (experienceList.length === 0) return null;

    return (
        <div className="my-16">
            <h2 className="font-headline text-3xl font-bold mb-8">{t("resume")}</h2>

            <div className="border-b mb-10">
                <div className="inline-block px-4 pb-2 border-b-4 border-primary">
                    <span className="text-sm font-bold text-foreground">
                        {t("workExperience")}
                    </span>
                </div>
            </div>

            <div className="space-y-12">
                {experienceList.map((exp: any, i: number) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-1">
                            <span className="text-sm font-medium text-muted-foreground">
                                {exp.duration}
                            </span>
                        </div>
                        <div className="md:col-span-3">
                            <h3 className="font-bold text-lg mb-1">
                                {exp.role} {exp.company ? `${t("at")} ${exp.company}` : ""}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {exp.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
