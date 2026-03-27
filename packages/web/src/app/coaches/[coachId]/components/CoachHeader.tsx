"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";

interface CoachHeaderProps {
    coach: any;
}

export function CoachHeader({ coach }: CoachHeaderProps) {
    const t = useTranslations("coachDetails");
    if (!coach) return null;

    return (
        <>
            <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={coach.avatarUrl} />
                    <AvatarFallback>{coach.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="font-headline text-4xl font-bold tracking-tighter text-primary md:text-5xl">
                        {coach.fullName}
                    </h1>
                    <p className="mt-1 text-lg text-foreground/70">{coach.title}</p>
                </div>
                <Badge
                    variant="outline"
                    className="flex items-center gap-1 border-yellow-400 bg-yellow-50/50 text-yellow-700 ml-auto px-2 py-0.5 text-[10px]"
                >
                    <Star className="h-3 w-3 fill-current text-yellow-500" />
                    <span className="font-semibold">{coach.rating}</span>
                </Badge>
                {coach.verified && (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 ml-2 px-2 py-0.5 text-[10px]">
                        {t("verified")}
                    </Badge>
                )}
            </div>
            <p className="mt-6 text-base text-muted-foreground">{coach.bio}</p>
        </>
    );
}
