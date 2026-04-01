/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings, Loader2, Plus, Trash2, Clock } from "lucide-react";
import {
  useCoachAvailability,
  useSaveCoachAvailability,
} from "@/hooks/use-schedule-queries";
import { useTranslations } from "next-intl";
import { CoachAvailability, DayAvailability } from "@/types";
export type { CoachAvailability, DayAvailability };

const DAYS = [
  { key: "monday", labelKey: "monday" },
  { key: "tuesday", labelKey: "tuesday" },
  { key: "wednesday", labelKey: "wednesday" },
  { key: "thursday", labelKey: "thursday" },
  { key: "friday", labelKey: "friday" },
  { key: "saturday", labelKey: "saturday" },
  { key: "sunday", labelKey: "sunday" },
];

const DEFAULT_AVAILABILITY: CoachAvailability = {
  monday: { enabled: true, intervals: [{ startTime: "09:00", endTime: "17:00" }] },
  tuesday: { enabled: true, intervals: [{ startTime: "09:00", endTime: "17:00" }] },
  wednesday: { enabled: true, intervals: [{ startTime: "09:00", endTime: "17:00" }] },
  thursday: { enabled: true, intervals: [{ startTime: "09:00", endTime: "17:00" }] },
  friday: { enabled: true, intervals: [{ startTime: "09:00", endTime: "17:00" }] },
  saturday: { enabled: false, intervals: [] },
  sunday: { enabled: false, intervals: [] },
};

interface AvailabilitySettingsProps {
  /** Whether to show the header and description */
  showHeader?: boolean;
  /** Whether to show the save button */
  showSaveButton?: boolean;
  /** Custom title for the component */
  title?: string;
  /** Custom description for the component */
  description?: string;
  /** Callback when availability changes (useful for onboarding) */
  onAvailabilityChange?: (
    availability: CoachAvailability,
  ) => void;
  /** Initial availability data (useful for onboarding) */
  initialAvailability?: CoachAvailability;
  /** Whether the component is in loading state */
  loading?: boolean;
  /** Whether the component is disabled */
  disabled?: boolean;
}

export function AvailabilitySettings({
  showHeader = true,
  showSaveButton = true,
  title,
  description,
  onAvailabilityChange,
  initialAvailability,
  loading = false,
  disabled = false,
}: AvailabilitySettingsProps) {
  const t = useTranslations("dashboard.coach.availability");
  const commonT = useTranslations("common");

  // Only use hooks if showSaveButton is true (dashboard mode)
  const { data: availabilityData, isLoading: loadingData } = showSaveButton
    ? useCoachAvailability()
    : { data: null as any, isLoading: false };
  const { mutate: saveAvailability, isPending: saving } = showSaveButton
    ? useSaveCoachAvailability()
    : { mutate: () => { }, isPending: false };

  const [availability, setAvailability] = useState<CoachAvailability>(
    initialAvailability || DEFAULT_AVAILABILITY
  );

  // Initialize from fetched data (dashboard mode)
  useEffect(() => {
    if (showSaveButton && availabilityData?.availability) {
      setAvailability(availabilityData.availability);
    }
  }, [availabilityData, showSaveButton]);

  // Initialize from prop (onboarding mode)
  useEffect(() => {
    if (initialAvailability) {
      // Use stringify to check for actual changes to avoid infinite loops
      const currentStr = JSON.stringify(availability);
      const incomingStr = JSON.stringify(initialAvailability);
      if (currentStr !== incomingStr) {
        setAvailability(initialAvailability);
      }
    }
  }, [initialAvailability]);

  // Notify parent of changes (onboarding mode)
  useEffect(() => {
    if (onAvailabilityChange) {
      // Only notify if different from initialAvailability to prevent loops
      const currentStr = JSON.stringify(availability);
      const initialStr = JSON.stringify(initialAvailability);
      if (currentStr !== initialStr) {
        onAvailabilityChange(availability);
      }
    }
  }, [availability, onAvailabilityChange, initialAvailability]);

  const handleToggleDay = (day: string) => {
    if (disabled) return;
    setAvailability((prev) => {
      const dayKey = day as keyof CoachAvailability;
      const isEnabled = !prev[dayKey].enabled;
      return {
        ...prev,
        [dayKey]: {
          ...prev[dayKey],
          enabled: isEnabled,
          intervals: isEnabled && (!prev[dayKey].intervals || prev[dayKey].intervals.length === 0)
            ? [{ startTime: "09:00", endTime: "17:00" }]
            : (prev[dayKey].intervals || [])
        },
      };
    });
  };

  const handleTimeChange = (
    day: string,
    index: number,
    field: "startTime" | "endTime",
    value: string,
  ) => {
    if (disabled) return;
    setAvailability((prev) => {
      const dayKey = day as keyof CoachAvailability;
      const newIntervals = [...(prev[dayKey].intervals || [])];
      newIntervals[index] = { ...newIntervals[index], [field]: value };
      return {
        ...prev,
        [dayKey]: { ...prev[dayKey], intervals: newIntervals },
      };
    });
  };

  const handleAddInterval = (day: string) => {
    if (disabled) return;
    setAvailability((prev) => {
      const dayKey = day as keyof CoachAvailability;
      const intervals = prev[dayKey].intervals || [];
      const lastInterval = intervals[intervals.length - 1];
      const startTime = lastInterval ? lastInterval.endTime : "09:00";
      // Add 1 hour or default to 17:00
      const [hour, minute] = startTime.split(":").map(Number);
      const endHour = Math.min(hour + 1, 23);
      const endTime = `${String(endHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

      return {
        ...prev,
        [dayKey]: {
          ...prev[dayKey],
          intervals: [...intervals, { startTime, endTime }]
        },
      };
    });
  };

  const handleRemoveInterval = (day: string, index: number) => {
    if (disabled) return;
    setAvailability((prev) => {
      const dayKey = day as keyof CoachAvailability;
      const intervals = prev[dayKey].intervals;
      const newIntervals = intervals.filter((_, i: number) => i !== index);
      return {
        ...prev,
        [dayKey]: {
          ...prev[dayKey],
          intervals: newIntervals,
          enabled: newIntervals.length > 0 ? prev[dayKey].enabled : false
        },
      };
    });
  };

  const handleSave = () => {
    if (showSaveButton) {
      saveAvailability(availability);
    }
  };

  const isLoading = loading || (showSaveButton && loadingData);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {title || t("title")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {description || t("description")}
          </p>
        </CardHeader>
      )}
      <CardContent className={showHeader ? "" : "pt-6"}>
        <div className="space-y-4">
          {DAYS.map(({ key, labelKey }) => (
            <div
              key={key}
              className="flex flex-col gap-3 py-4 border-b last:border-0"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-[140px]">
                  <Switch
                    checked={availability[key as keyof CoachAvailability].enabled}
                    onCheckedChange={() => handleToggleDay(key)}
                    disabled={disabled || (showSaveButton && saving)}
                  />
                  <Label className="font-medium">
                    {commonT(`days.${labelKey}`)}
                  </Label>
                </div>

                {availability[key as keyof CoachAvailability].enabled && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddInterval(key)}
                    disabled={disabled || (showSaveButton && saving)}
                    className="h-9 rounded-xl border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Add Slot
                  </Button>
                )}

                {!availability[key as keyof CoachAvailability].enabled && (
                  <span className="text-sm text-muted-foreground font-medium bg-muted/50 px-3 py-1 rounded-full">
                    {t("notAvailable")}
                  </span>
                )}
              </div>

              {availability[key as keyof CoachAvailability].enabled && (
                <div className="flex flex-col gap-3 pl-10 animate-in fade-in slide-in-from-top-2 duration-300">
                  {(availability[key as keyof CoachAvailability].intervals || []).map((interval, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex flex-1 items-center gap-2 p-1.5 bg-muted/30 rounded-xl border border-border/50 transition-all focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/5 group/interval">
                        <div className="flex flex-1 items-center gap-2 px-2 py-1.5 bg-background rounded-lg border shadow-sm min-w-[110px]">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <input
                            type="time"
                            value={interval.startTime}
                            onChange={(e) =>
                              handleTimeChange(key, index, "startTime", e.target.value)
                            }
                            className="bg-transparent border-none focus:ring-0 text-sm font-medium w-full appearance-none outline-none"
                            disabled={disabled || (showSaveButton && saving)}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase px-1 shrink-0">
                          {t("to")}
                        </span>
                        <div className="flex flex-1 items-center gap-2 px-2 py-1.5 bg-background rounded-lg border shadow-sm min-w-[110px]">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <input
                            type="time"
                            value={interval.endTime}
                            onChange={(e) =>
                              handleTimeChange(key, index, "endTime", e.target.value)
                            }
                            className="bg-transparent border-none focus:ring-0 text-sm font-medium w-full appearance-none outline-none"
                            disabled={disabled || (showSaveButton && saving)}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveInterval(key, index)}
                          disabled={disabled || (showSaveButton && saving)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors ml-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(!availability[key as keyof CoachAvailability].intervals || availability[key as keyof CoachAvailability].intervals.length === 0) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground italic bg-muted/20 p-3 rounded-xl border border-dashed">
                      <Settings className="h-4 w-4 opacity-50" />
                      No time slots added.
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {showSaveButton && (
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} disabled={saving || disabled}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t("saving")}
                </>
              ) : (
                t("save")
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
