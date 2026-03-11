"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    coach: any;
    duration: string;
    setDuration: (d: string) => void;
    onConfirm: (slot: { date: Date; time: string }) => void;
    isCheckingOut: boolean;
    availabilityData?: any;
}

export function BookingModal({
    isOpen,
    onClose,
    coach,
    duration,
    setDuration,
    onConfirm,
    isCheckingOut,
    availabilityData,
}: BookingModalProps) {
    const [selectedSlot, setSelectedSlot] = useState<{
        date: Date;
        time: string;
    } | null>(null);
    const [weekOffset, setWeekOffset] = useState(0);
    const t = useTranslations("coachDetails");
    const activeLocale = useLocale();

    // Generate slots for the UI based on 30min intervals
    const rawTimeSlots = Array.from({ length: 24 }, (_, i) => {
        const hour = i.toString().padStart(2, "0");
        return [`${hour}:00`, `${hour}:30`];
    }).flat();

    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        // Start of current week (assuming today is the start or just 7 days from today)
        // To match screenshot "Mar 2-8", let's assume it starts from the first day of the displayed week
        d.setDate(d.getDate() + weekOffset * 7 + i);
        return {
            name: d.toLocaleDateString(activeLocale, { weekday: "short" }),
            fullName: d
                .toLocaleDateString("en-US", { weekday: "long" })
                .toLowerCase(),
            dayNum: d.getDate(),
            fullDate: d,
        };
    });

    const isAvailable = (dayFullName: string, time: string, dayFullDate?: Date) => {
        if (!availabilityData) return true;
        const dayAvail = availabilityData[dayFullName];
        if (!dayAvail || !dayAvail.enabled) return false;

        const [hours, minutes] = time.split(":").map(Number);
        const [startH, startM] = dayAvail.startTime.split(":").map(Number);
        const [endH, endM] = dayAvail.endTime.split(":").map(Number);

        const timeInMins = hours * 60 + minutes;
        const startInMins = startH * 60 + startM;
        const endInMins = endH * 60 + endM;

        // Check if the slot is in the past
        if (dayFullDate) {
            const now = new Date();
            const slotDate = new Date(dayFullDate);
            slotDate.setHours(hours, minutes, 0, 0);

            if (slotDate < now) {
                return false;
            }
        }

        return timeInMins >= startInMins && timeInMins < endInMins;
    };

    const calculatedPrice = Math.round(
        (coach.hourlyRate * parseInt(duration)) / 60
    );

    const formatDateRange = () => {
        const start = weekDays[0].fullDate;
        const end = weekDays[6].fullDate;

        const formatMonth = (d: Date) => d.toLocaleDateString(activeLocale, { month: "short" });
        const formatDay = (d: Date) => d.getDate();
        const formatYear = (d: Date) => d.getFullYear();

        if (start.getMonth() === end.getMonth()) {
            return `${formatMonth(start)} ${formatDay(start)}–${formatDay(end)}, ${formatYear(end)}`;
        }
        return `${formatMonth(start)} ${formatDay(start)} – ${formatMonth(end)} ${formatDay(end)}, ${formatYear(end)}`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] p-8 overflow-hidden gap-0 rounded-3xl">

                <DialogHeader className="mb-8">
                    <DialogTitle className="text-2xl font-bold text-left">
                        {t("selectTimeSlot")}
                    </DialogTitle>
                </DialogHeader>

                {/* Duration Toggle */}
                <div className="flex gap-4 mb-10">
                    <button
                        className={cn(
                            "flex-1 py-4 text-sm font-bold transition-all rounded-xl border-2",
                            duration === "30"
                                ? "bg-[#00966d] border-[#00966d] text-white"
                                : "bg-white border-muted text-muted-foreground hover:border-primary/30"
                        )}
                        onClick={() => setDuration("30")}
                    >
                        30 {t("min")}
                    </button>
                    <button
                        className={cn(
                            "flex-1 py-4 text-sm font-bold transition-all rounded-xl border-2",
                            duration === "60"
                                ? "bg-[#00966d] border-[#00966d] text-white"
                                : "bg-white border-muted text-muted-foreground hover:border-primary/30"
                        )}
                        onClick={() => setDuration("60")}
                    >
                        60 {t("min")}
                    </button>
                </div>

                {/* Date Navigation */}
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold">{formatDateRange()}</h3>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="font-bold text-xs px-4"
                            onClick={() => {
                                setWeekOffset(0);
                                setSelectedSlot(null);
                            }}
                        >
                            {t("today")}
                        </Button>
                        <div className="flex border rounded-lg overflow-hidden">
                            <button
                                className="p-2 hover:bg-muted border-r transition-colors"
                                onClick={() => setWeekOffset(prev => prev - 1)}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                className="p-2 hover:bg-muted transition-colors"
                                onClick={() => setWeekOffset(prev => prev + 1)}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 mb-4 px-2">
                    {weekDays.map((day) => {
                        const isSelectedDay = selectedSlot?.date.toDateString() === day.fullDate.toDateString();
                        return (
                            <div key={day.fullName} className="flex flex-col items-center">
                                <span className={cn(
                                    "text-xs font-medium mb-1",
                                    isSelectedDay ? "text-[#00966d]" : "text-muted-foreground"
                                )}>
                                    {day.name}
                                </span>
                                <span className={cn(
                                    "text-base font-bold",
                                    isSelectedDay && "text-[#00966d]"
                                )}>
                                    {day.dayNum}
                                </span>
                                {isSelectedDay && <div className="w-1 h-1 bg-[#00966d] rounded-full mt-1" />}
                            </div>
                        );
                    })}
                </div>

                {/* Time Slots Area */}
                <div className="relative border rounded-2xl overflow-hidden bg-white mb-8">
                    <ScrollArea className="h-[300px] w-full p-4">
                        <div className="flex flex-col gap-2">
                            {rawTimeSlots.map((time) => {
                                const isAnyDayAvailable = weekDays.some(day => isAvailable(day.fullName, time, day.fullDate));
                                if (!isAnyDayAvailable) return null;

                                return (
                                    <div key={time} className="grid grid-cols-7 gap-x-2 items-center">
                                        {weekDays.map((day) => {
                                            const available = isAvailable(day.fullName, time, day.fullDate);
                                            const isSelected = selectedSlot?.time === time && selectedSlot?.date.toDateString() === day.fullDate.toDateString();

                                            return (
                                                <button
                                                    key={`${day.fullName}-${time}`}
                                                    disabled={!available}
                                                    className={cn(
                                                        "text-sm font-medium py-1.5 px-1 transition-all rounded hover:text-[#00966d] flex justify-center",
                                                        !available && "opacity-0 pointer-events-none",
                                                        isSelected ? "text-[#00966d] font-bold" : "text-foreground"
                                                    )}
                                                    onClick={() => setSelectedSlot({ date: day.fullDate, time })}
                                                >
                                                    {time}
                                                </button>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>

                {/* Action Button */}
                <Button
                    className={cn(
                        "w-full h-16 text-lg font-bold rounded-2xl transition-all shadow-md",
                        selectedSlot
                            ? "bg-[#bbf7d0] hover:bg-[#86efac] text-[#065f46]"
                            : "bg-[#d1fae5] text-[#065f46]/50 cursor-not-allowed"
                    )}
                    onClick={() => selectedSlot && onConfirm(selectedSlot)}
                    disabled={!selectedSlot || isCheckingOut}
                >
                    {isCheckingOut ? t("processing") : `${t("confirmBooking")} - €${calculatedPrice}`}
                </Button>
            </DialogContent>
        </Dialog>
    );
}
