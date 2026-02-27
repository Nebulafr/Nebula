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

export interface DayAvailability {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

const DAYS = [
  { key: "monday", labelKey: "monday" },
  { key: "tuesday", labelKey: "tuesday" },
  { key: "wednesday", labelKey: "wednesday" },
  { key: "thursday", labelKey: "thursday" },
  { key: "friday", labelKey: "friday" },
  { key: "saturday", labelKey: "saturday" },
  { key: "sunday", labelKey: "sunday" },
];

const DEFAULT_AVAILABILITY: Record<string, DayAvailability> = {
  monday: { enabled: true, startTime: "09:00", endTime: "17:00" },
  tuesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
  wednesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
  thursday: { enabled: true, startTime: "09:00", endTime: "17:00" },
  friday: { enabled: true, startTime: "09:00", endTime: "17:00" },
  saturday: { enabled: false, startTime: "09:00", endTime: "17:00" },
  sunday: { enabled: false, startTime: "09:00", endTime: "17:00" },
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
    availability: Record<string, DayAvailability>,
  ) => void;
  /** Initial availability data (useful for onboarding) */
  initialAvailability?: Record<string, DayAvailability>;
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

  const [availability, setAvailability] = useState<
    Record<string, DayAvailability>
  >(initialAvailability || DEFAULT_AVAILABILITY);

  // Initialize from fetched data (dashboard mode)
  useEffect(() => {
    if (showSaveButton && availabilityData?.availability) {
      const fetchedAvailability = availabilityData.availability;
      setAvailability((prev) => ({
        ...prev,
        ...fetchedAvailability,
      }));
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
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
  };

  const handleTimeChange = (
    day: string,
    field: "startTime" | "endTime",
    value: string,
  ) => {
    if (disabled) return;
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
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
              className="flex items-center justify-between gap-4 py-2 border-b last:border-0"
            >
              <div className="flex items-center gap-3 min-w-[140px]">
                <Switch
                  checked={availability[key].enabled}
                  onCheckedChange={() => handleToggleDay(key)}
                  disabled={disabled || (showSaveButton && saving)}
                />
                <Label className="font-medium">
                  {commonT(`days.${labelKey}`)}
                </Label>
              </div>

              {availability[key].enabled && (
                <div className="flex items-center gap-2 text-sm">
                  <input
                    type="time"
                    value={availability[key].startTime}
                    onChange={(e) =>
                      handleTimeChange(key, "startTime", e.target.value)
                    }
                    className="border rounded px-2 py-1 text-sm"
                    disabled={disabled || (showSaveButton && saving)}
                  />
                  <span className="text-muted-foreground">{t("to")}</span>
                  <input
                    type="time"
                    value={availability[key].endTime}
                    onChange={(e) =>
                      handleTimeChange(key, "endTime", e.target.value)
                    }
                    className="border rounded px-2 py-1 text-sm"
                    disabled={disabled || (showSaveButton && saving)}
                  />
                </div>
              )}

              {!availability[key].enabled && (
                <span className="text-sm text-muted-foreground">
                  {t("notAvailable")}
                </span>
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
