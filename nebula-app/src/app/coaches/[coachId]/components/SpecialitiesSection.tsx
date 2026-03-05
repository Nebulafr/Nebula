"use client";

import { Badge } from "@/components/ui/badge";

interface SpecialitiesSectionProps {
    coach: any;
}

export function SpecialitiesSection({ coach }: SpecialitiesSectionProps) {
    if (!coach.specialties || coach.specialties.length === 0) return null;

    return (
        <div className="my-16">
            <h2 className="font-headline text-3xl font-bold mb-8">Specialities</h2>
            <div className="flex flex-wrap gap-3">
                {coach.specialties.map((spec: any, idx: number) => (
                    <Badge
                        key={idx}
                        variant="secondary"
                        className="px-4 py-2 text-sm font-medium hover:bg-primary hover:text-white transition-colors cursor-default"
                    >
                        {spec.category?.name}
                    </Badge>
                ))}
            </div>
        </div>
    );
}
