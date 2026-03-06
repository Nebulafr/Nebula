"use client";

import { Button } from "@/components/ui/button";
import { Info, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { useTranslations, useLocale } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface ScheduleOverviewProps {
    availabilityData: any;
    weekOffset: number;
    setWeekOffset: React.Dispatch<React.SetStateAction<number>>;
    duration: string;
    setDuration: (d: string) => void;
    openBookingModal: () => void;
}

export function ScheduleOverview({
    availabilityData,
    weekOffset,
    setWeekOffset,
    duration,
    setDuration,
    openBookingModal,
}: ScheduleOverviewProps) {
    const t = useTranslations("coachDetails");
    const activeLocale = useLocale();

    return (
        <div className="my-16">
            <div className="my-20">
                <h2 className="font-headline text-3xl font-bold mb-8">
                    {t("schedule")}
                </h2>
                <p className="text-muted-foreground mb-8">
                    {t("scheduleInfo")}
                </p>
            </div>

            <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="w-[180px] mb-8">
                    <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="30">30 {t("min")}</SelectItem>
                    <SelectItem value="60">60 {t("min")}</SelectItem>
                </SelectContent>
            </Select>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-6">
                    <div className="flex items-center border rounded-lg overflow-hidden bg-background">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-none border-r hover:bg-muted"
                            onClick={() => setWeekOffset((prev) => prev - 1)}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-none hover:bg-muted"
                            onClick={() => setWeekOffset((prev) => prev + 1)}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <span className="font-bold text-lg">
                        {(() => {
                            const start = new Date();
                            start.setDate(start.getDate() + weekOffset * 7);
                            const end = new Date(start);
                            end.setDate(end.getDate() + 6);

                            const formatShort = (d: Date) =>
                                d.toLocaleDateString(activeLocale, {
                                    month: "long",
                                    day: "numeric",
                                });
                            const formatYear = (d: Date) => d.getFullYear();

                            // Localization for specific range format in the image: "5–11 mars 2026"
                            const startDay = start.getDate();
                            const endDay = end.getDate();
                            const month = end.toLocaleDateString("fr-FR", { month: "long" });
                            const year = formatYear(end);

                            if (start.getMonth() !== end.getMonth()) {
                                return `${startDay} ${start.toLocaleDateString("fr-FR", { month: "short" })} – ${endDay} ${month} ${year} `;
                            }
                            return `${startDay}–${endDay} ${month} ${year} `;
                        })()}
                    </span>
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-6 text-sm text-foreground border rounded-lg px-4 py-2 bg-background select-none cursor-default min-w-[240px] justify-between h-14">
                        <div className="flex flex-col">
                            <span className="font-medium text-base">
                                {Intl.DateTimeFormat().resolvedOptions().timeZone}
                            </span>
                            <span className="text-xs text-muted-foreground uppercase">
                                GMT {new Date().getTimezoneOffset() / -60 >= 0 ? "+" : ""}
                                {Math.abs(new Date().getTimezoneOffset() / -60)}:00
                            </span>
                        </div>
                        <ChevronRight className="h-5 w-5 rotate-90 text-foreground" />
                    </div>
                </div>
            </div>

            <div className="relative mt-8 mb-8">
                <div className="grid grid-cols-7 gap-1 mb-6">
                    {Array.from({ length: 7 }, (_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() + weekOffset * 7 + i);
                        const isPast = d < new Date(new Date().setHours(0, 0, 0, 0));
                        return (
                            <div
                                key={i}
                                className={cn(
                                    "h-1.5 rounded-full",
                                    isPast ? "bg-muted" : "bg-primary"
                                )}
                            />
                        );
                    })}
                </div>

                <div className="grid grid-cols-7">
                    {Array.from({ length: 7 }, (_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() + weekOffset * 7 + i);
                        const dayName = d.toLocaleDateString("fr-FR", { weekday: "short" }).replace(/\.$/, "");
                        const formattedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
                        const dayNum = d.getDate();
                        const dayFullName = d.toLocaleDateString("en-US", {
                            weekday: "long",
                        }).toLowerCase();

                        const dayAvail = availabilityData?.[dayFullName];
                        let slotsForDay: string[] = [];
                        if (dayAvail?.enabled) {
                            const [startH, startM] = dayAvail.startTime.split(":").map(Number);
                            const [endH, endM] = dayAvail.endTime.split(":").map(Number);
                            const startTotal = startH * 60 + startM;
                            const endTotal = endH * 60 + endM;
                            const step = parseInt(duration);

                            for (let t = startTotal; t < endTotal; t += step) {
                                const h = Math.floor(t / 60)
                                    .toString()
                                    .padStart(2, "0");
                                const m = (t % 60).toString().padStart(2, "0");
                                slotsForDay.push(`${h}:${m} `);
                            }
                        }

                        return (
                            <div key={i} className="flex flex-col items-center">
                                <div className="text-center mb-8">
                                    <span className="text-sm text-foreground/70 block mb-1 font-medium">
                                        {formattedDayName}.
                                    </span>
                                    <span className="text-lg font-medium text-foreground">
                                        {dayNum}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-6 w-full items-center">
                                    {slotsForDay.slice(0, 6).map((time, idx) => (
                                        <button
                                            key={idx}
                                            className="text-base font-bold text-foreground hover:text-primary underline decoration-foreground hover:decoration-primary transition-all underline-offset-[6px] decoration-1"
                                            onClick={openBookingModal}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                    {slotsForDay.length === 0 && (
                                        <div className="h-2 w-2 rounded-full bg-transparent mt-2" />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex justify-center mt-12">
                <Button
                    variant="outline"
                    className="rounded-xl px-12 py-6 text-base font-bold border-muted-foreground/30 hover:bg-muted/5 transition-all h-auto"
                    onClick={openBookingModal}
                >
                    {t("viewAllSchedule")}
                </Button>
            </div>
        </div>
    );
}
