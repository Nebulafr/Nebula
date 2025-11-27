import { apiPost } from "@/lib/utils";

export async function bookCoachSession({
  coachSlug,
  date,
  time,
  duration = 60, // default 60 minutes
  notes = "",
}: {
  coachSlug: string;
  date: Date;
  time: string;
  duration?: number;
  notes?: string;
}) {
  try {
    // Combine date and time into a scheduledAt timestamp
    const [hours, minutes] = time.split(":").map(Number);
    const scheduledAt = new Date(date);
    scheduledAt.setHours(hours, minutes, 0, 0);

    const sessionData = {
      scheduledAt: scheduledAt.toISOString(),
      duration,
      notes,
    };

    const response = await apiPost(`/coaches/${coachSlug}/book`, sessionData);

    if (!response.success) {
      throw new Error(
        response.error || response.message || "Failed to book session"
      );
    }

    return {
      success: true,
      data: response.data,
      message: response.message || "Session booked successfully",
    };
  } catch (error: any) {
    console.error("Error booking session:", error);
    return {
      success: false,
      error: error.message || "Failed to book session",
    };
  }
}
