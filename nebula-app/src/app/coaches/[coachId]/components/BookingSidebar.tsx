"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface BookingSidebarProps {
    onMessageClick: () => void;
    openBookingModal: () => void;
}

export function BookingSidebar({
    onMessageClick,
    openBookingModal,
}: BookingSidebarProps) {
    const t = useTranslations("coachDetails");
    return (
        <Card className="rounded-xl border shadow-lg">
            <CardContent className="p-6 text-center">
                <h3 className="font-headline text-2xl font-bold">{t("bookSession")}</h3>
                <p className="text-muted-foreground mt-2 mb-6">
                    {t("findTime")}
                </p>
                <div className="flex flex-col gap-3">
                    <Button size="lg" className="w-full" onClick={openBookingModal}>
                        {t("bookNow")}
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="w-full"
                        onClick={onMessageClick}
                    >
                        <MessageCircle className="mr-2 h-5 w-5" /> {t("message")}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
