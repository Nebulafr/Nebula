"use client";

import { useTranslations } from "next-intl";

interface ExperienceLogosProps {
    coach: any;
}

export function ExperienceLogos({ coach }: ExperienceLogosProps) {
    const t = useTranslations("coachDetails");
    if (!coach.pastCompanies || coach.pastCompanies.length === 0) return null;

    return (
        <div className="mt-8">
            <h4 className="text-sm font-semibold text-muted-foreground">
                {t("workedAt", { name: coach.fullName.split(" ")[0] })}
            </h4>
            <div className="mt-4 flex flex-wrap items-center gap-4">
                {coach.pastCompanies.map((company: string, idx: number) => (
                    <div
                        key={idx}
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-center px-2 text-[10px] font-bold text-gray-700 overflow-hidden"
                    >
                        {company}
                    </div>
                ))}
            </div>
        </div>
    );
}
