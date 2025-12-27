import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/utils";

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
  const sessionData = {
    coachId,
    date: date.toISOString(),
    startTime: time,
    duration,
  };

  return apiPost(`/coaches/${coachId}/book`, sessionData);
}

// Coach dashboard session actions
export async function getCoachSessions(
  filter: "today" | "upcoming" | "past" | "all" = "upcoming"
) {
  return apiGet(`/coaches/sessions?filter=${filter}`);
}

export async function getCoachStats() {
  return apiGet("/coaches/stats");
}

export async function createCoachSession(data: {
  title: string;
  description?: string;
  scheduledTime: string;
  duration?: number;
  studentIds?: string[];
  meetLink?: string;
}) {
  return apiPost("/coaches/sessions", data);
}

export async function updateCoachSession(
  sessionId: string,
  data: {
    title?: string;
    description?: string;
    scheduledTime?: string;
    duration?: number;
    status?: string;
    meetLink?: string;
    notes?: string;
  }
) {
  return apiPut(`/coaches/sessions/${sessionId}`, data);
}

export async function cancelCoachSession(sessionId: string, reason?: string) {
  return apiPut(`/coaches/sessions/${sessionId}/cancel`, { reason });
}

// Coach availability actions
export async function getCoachAvailability() {
  return apiGet("/coaches/availability");
}

export interface DayAvailability {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export async function saveCoachAvailability(
  availability: Record<string, DayAvailability>
) {
  return apiPut("/coaches/availability", { availability });
}

export async function updateAvailabilitySlot(
  slotId: string,
  data: {
    startTime?: string;
    endTime?: string;
    isAvailable?: boolean;
  }
) {
  return apiPut(`/coaches/availability/${slotId}`, data);
}

export async function deleteAvailabilitySlot(slotId: string) {
  return apiDelete(`/coaches/availability/${slotId}`);
}
