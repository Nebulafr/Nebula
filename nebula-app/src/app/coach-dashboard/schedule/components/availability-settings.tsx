"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Clock, Settings, Loader2 } from "lucide-react";
import {
  useCoachAvailability,
  useSaveCoachAvailability,
} from "@/hooks/use-schedule-queries";

export interface DayAvailability {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

const DAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
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

export function AvailabilitySettings() {
  const { data: availabilityData, isLoading: loadingData } =
    useCoachAvailability();
  const { mutate: saveAvailability, isPending: saving } =
    useSaveCoachAvailability();

  const [availability, setAvailability] =
    useState<Record<string, DayAvailability>>(DEFAULT_AVAILABILITY);

  // Initialize from fetched data
  useEffect(() => {
    if (availabilityData?.data?.availability) {
      const fetchedAvailability = availabilityData.data.availability;
      // Merge fetched data with defaults to ensure all days exist
      setAvailability((prev) => ({
        ...prev,
        ...fetchedAvailability,
      }));
    }
  }, [availabilityData]);

  const handleToggleDay = (day: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
  };

  const handleTimeChange = (
    day: string,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleSave = () => {
    saveAvailability(availability);
  };

  if (loadingData) {
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Availability Settings
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Set your weekly availability for coaching sessions
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {DAYS.map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center justify-between gap-4 py-2 border-b last:border-0"
            >
              <div className="flex items-center gap-3 min-w-[140px]">
                <Switch
                  checked={availability[key].enabled}
                  onCheckedChange={() => handleToggleDay(key)}
                  disabled={saving}
                />
                <Label className="font-medium">{label}</Label>
              </div>

              {availability[key].enabled && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="time"
                    value={availability[key].startTime}
                    onChange={(e) =>
                      handleTimeChange(key, "startTime", e.target.value)
                    }
                    className="border rounded px-2 py-1 text-sm"
                    disabled={saving}
                  />
                  <span className="text-muted-foreground">to</span>
                  <input
                    type="time"
                    value={availability[key].endTime}
                    onChange={(e) =>
                      handleTimeChange(key, "endTime", e.target.value)
                    }
                    className="border rounded px-2 py-1 text-sm"
                    disabled={saving}
                  />
                </div>
              )}

              {!availability[key].enabled && (
                <span className="text-sm text-muted-foreground">
                  Not available
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Save Availability"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
