"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

interface SpecialitiesSectionProps {
    coach: any;
}

export function SpecialitiesSection({ coach }: SpecialitiesSectionProps) {
    const t = useTranslations("coachDetails");
    if (!coach.specialties || coach.specialties.length === 0) return null;

    return (
        <div className="my-16">
            <h2 className="font-headline text-3xl font-bold mb-8">{t("specialities")}</h2>
            <div className="flex flex-wrap gap-3">
                {coach.specialties.map((spec: any, idx: number) => (
                    <Badge
                        key={spec.id || idx}
                        variant="secondary"
                        className="px-4 py-2 text-sm font-medium hover:bg-primary hover:text-white transition-colors cursor-default"
                    >
                        {spec.name || spec}
                    </Badge>
                ))}
            </div>
        </div>
    );
}
