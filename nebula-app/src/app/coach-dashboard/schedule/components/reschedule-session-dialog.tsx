"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Session } from "./appointment-item";
import { useTranslations } from "next-intl";

interface RescheduleSessionDialogProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: Date, startTime: string) => Promise<void>;
  isLoading?: boolean;
}

export function RescheduleSessionDialog({
  session,
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: RescheduleSessionDialogProps) {
  const t = useTranslations("dashboard.coach.schedule.rescheduleDialog");
  const commonT = useTranslations("common");
  
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState<string>("");

  // Initialize values when session changes or dialog opens
  useMemo(() => {
    if (session && isOpen) {
      const sessionDate = new Date(session.scheduledTime);
      setDate(sessionDate);
      
      const hours = sessionDate.getHours().toString().padStart(2, "0");
      const minutes = sessionDate.getMinutes().toString().padStart(2, "0");
      setStartTime(`${hours}:${minutes}`);
    }
  }, [session, isOpen]);

  if (!session) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (date && startTime) {
      await onConfirm(date, startTime);
    }
  };

  // Generate time slots (every 30 mins)
  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2).toString().padStart(2, "0");
    const min = (i % 2 === 0 ? "00" : "30");
    return `${hour}:${min}`;
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>
              {t("description", { title: session.title })}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="flex flex-col gap-2 items-center">
              <Label className="self-start">{t("dateLabel")}</Label>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="startTime">{t("timeLabel")}</Label>
              <Select
                value={startTime}
                onValueChange={setStartTime}
                disabled={isLoading}
              >
                <SelectTrigger id="startTime">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              {commonT("cancel")}
            </Button>
            <Button type="submit" disabled={isLoading || !date || !startTime}>
              {isLoading ? commonT("processing") : t("confirmButton")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
