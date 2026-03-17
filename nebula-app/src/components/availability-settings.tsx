/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings, Loader2 } from "lucide-react";
import {
  useCoachAvailability,
  useSaveCoachAvailability,
} from "@/hooks/use-schedule-queries";
import { useTranslations } from "next-intl";
import { CoachAvailability, DayAvailability } from "@/types/coach";
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
      setAvailability(initialAvailability);
    }
  }, [initialAvailability]);

  // Notify parent of changes (onboarding mode)
  useEffect(() => {
    if (onAvailabilityChange) {
      onAvailabilityChange(availability);
    }
  }, [availability, onAvailabilityChange]);

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
                    className="h-8"
                  >
                    + Add Slot
                  </Button>
                )}

                {!availability[key as keyof CoachAvailability].enabled && (
                  <span className="text-sm text-muted-foreground">
                    {t("notAvailable")}
                  </span>
                )}
              </div>

              {availability[key as keyof CoachAvailability].enabled && (
                <div className="flex flex-col gap-2 pl-14">
                  {(availability[key as keyof CoachAvailability].intervals || []).map((interval, index) => (
                    <div key={index} className="flex items-center gap-2 group">
                      <div className="flex items-center gap-2 text-sm">
                        <input
                          type="time"
                          value={interval.startTime}
                          onChange={(e) =>
                            handleTimeChange(key, index, "startTime", e.target.value)
                          }
                          className="border rounded px-2 py-1 text-sm bg-background"
                          disabled={disabled || (showSaveButton && saving)}
                        />
                        <span className="text-muted-foreground">{t("to")}</span>
                        <input
                          type="time"
                          value={interval.endTime}
                          onChange={(e) =>
                            handleTimeChange(key, index, "endTime", e.target.value)
                          }
                          className="border rounded px-2 py-1 text-sm bg-background"
                          disabled={disabled || (showSaveButton && saving)}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveInterval(key, index)}
                        disabled={disabled || (showSaveButton && saving)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  {(!availability[key as keyof CoachAvailability].intervals || availability[key as keyof CoachAvailability].intervals.length === 0) && (
                    <span className="text-sm text-muted-foreground italic">
                      No time slots added.
                    </span>
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
