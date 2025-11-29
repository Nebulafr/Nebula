import { BookSessionData } from "@/app/api/utils/schemas";
import { apiPost } from "@/lib/utils";

export async function bookCoachSession({
  coachId,
  date,
  time,
  duration = 60,
}: {
  coachId: string;
  date: Date;
  time: string;
  duration?: number;
}) {
  try {
    const sessionData: BookSessionData = {
      coachId,
      date: date.toISOString(),
      startTime: time,
      duration,
    };

    const response = await apiPost(`/coaches/${coachId}/book`, sessionData);

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
