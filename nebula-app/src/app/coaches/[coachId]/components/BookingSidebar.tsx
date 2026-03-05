"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

interface BookingSidebarProps {
    onMessageClick: () => void;
    openBookingModal: () => void;
}

export function BookingSidebar({
    onMessageClick,
    openBookingModal,
}: BookingSidebarProps) {
    return (
        <Card className="rounded-xl border shadow-lg">
            <CardContent className="p-6 text-center">
                <h3 className="font-headline text-2xl font-bold">Book a session</h3>
                <p className="text-muted-foreground mt-2 mb-6">
                    Find a time that works for you in the schedule.
                </p>
                <div className="flex flex-col gap-3">
                    <Button size="lg" className="w-full" onClick={openBookingModal}>
                        Book now
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="w-full"
                        onClick={onMessageClick}
                    >
                        <MessageCircle className="mr-2 h-5 w-5" /> Message Coach
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
