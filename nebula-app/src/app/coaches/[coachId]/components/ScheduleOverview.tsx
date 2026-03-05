"use client";

import { Button } from "@/components/ui/button";
import { Info, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
    return (
        <div className="my-16">
            <h2 className="font-headline text-3xl font-bold mb-8">Schedule</h2>

            <div className="flex items-start gap-4 p-4 mb-8 rounded-lg bg-primary/5 border border-primary/10">
                <Info className="h-5 w-5 text-primary mt-0.5" />
                <p className="text-sm text-foreground/80 leading-relaxed">
                    Choose the time for your first lesson. The timings are displayed in
                    your local timezone.
                </p>
            </div>

            <div className="bg-muted/30 p-1 rounded-xl flex mb-8 max-w-sm">
                <button
                    className={cn(
                        "flex-1 py-3 text-sm font-semibold transition-all rounded-lg",
                        duration === "30"
                            ? "bg-background shadow-sm text-primary"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setDuration("30")}
                >
                    30 min
                </button>
                <button
                    className={cn(
                        "flex-1 py-3 text-sm font-semibold transition-all rounded-lg",
                        duration === "60"
                            ? "bg-background shadow-sm text-primary"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setDuration("60")}
                >
                    60 min
                </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-lg overflow-hidden bg-background">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-none border-r hover:bg-muted"
                            onClick={() => setWeekOffset((prev) => prev - 1)}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-none hover:bg-muted"
                            onClick={() => setWeekOffset((prev) => prev + 1)}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <span className="font-bold text-base">
                        {(() => {
                            const start = new Date();
                            start.setDate(start.getDate() + weekOffset * 7);
                            const end = new Date(start);
                            end.setDate(end.getDate() + 6);

                            const formatShort = (d: Date) =>
                                d.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                });
                            const formatYear = (d: Date) => d.getFullYear();

                            if (start.getFullYear() !== end.getFullYear()) {
                                return `${formatShort(start)}, ${start.getFullYear()} – ${formatShort(
                                    end
                                )}, ${end.getFullYear()}`;
                            }
                            return `${formatShort(start)} – ${start.getMonth() === end.getMonth()
                                    ? end.getDate()
                                    : formatShort(end)
                                }, ${formatYear(end)}`;
                        })()}
                    </span>
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-6 text-sm text-foreground/70 border rounded-lg px-4 py-2 bg-background select-none cursor-default min-w-[220px] justify-between">
                        <div className="flex flex-col">
                            <span className="font-medium">
                                {Intl.DateTimeFormat().resolvedOptions().timeZone}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                                GMT {new Date().getTimezoneOffset() / -60 >= 0 ? "+" : ""}
                                {new Date().getTimezoneOffset() / -60}:00
                            </span>
                        </div>
                        <ChevronRight className="h-4 w-4 rotate-90 text-muted-foreground" />
                    </div>
                </div>
            </div>

            <div className="relative mt-12 mb-8">
                <div className="absolute -top-4 left-[14.28%] right-0 h-1 bg-primary rounded-full" />

                <div className="grid grid-cols-7 border-t pt-6">
                    {Array.from({ length: 7 }, (_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() + weekOffset * 7 + i);
                        const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
                        const dayFullName = d.toLocaleDateString("en-US", {
                            weekday: "long",
                        }).toLowerCase();
                        const dayNum = d.getDate();
                        const isToday = i === 0 && weekOffset === 0;

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
                                slotsForDay.push(`${h}:${m}`);
                            }
                        }

                        return (
                            <div key={i} className="flex flex-col items-center">
                                <div className="text-center mb-8">
                                    <span className="text-xs text-muted-foreground block mb-1 font-medium">
                                        {dayName}
                                    </span>
                                    <span
                                        className={cn(
                                            "text-lg font-bold",
                                            isToday && "text-primary"
                                        )}
                                    >
                                        {dayNum}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-5 w-full items-center">
                                    {slotsForDay.slice(0, 7).map((time, idx) => (
                                        <button
                                            key={idx}
                                            className="text-sm font-bold text-foreground hover:text-primary underline decoration-foreground/30 hover:decoration-primary transition-all underline-offset-4"
                                            onClick={openBookingModal}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                    {slotsForDay.length > 7 && (
                                        <button
                                            className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors mt-1 uppercase"
                                            onClick={openBookingModal}
                                        >
                                            + more
                                        </button>
                                    )}
                                    {slotsForDay.length === 0 && (
                                        <span className="h-2 w-2 rounded-full bg-muted/30 mt-2" />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
