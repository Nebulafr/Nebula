import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from "@/lib/utils";

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

  return apiPost(`/coaches/${coachId}/book`, sessionData, { throwOnError: true });
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
  return apiPost("/coaches/sessions", data, { throwOnError: true });
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
  return apiPatch(`/sessions/${sessionId}`, data, { throwOnError: true });
}

export async function rescheduleCoachSession(
  sessionId: string,
  data: {
    date: string;
    startTime: string;
    timezone?: string;
  }
) {
  return apiPost(`/sessions/${sessionId}/reschedule`, data, { throwOnError: true });
}

export async function cancelCoachSession(sessionId: string, reason?: string) {
  return apiPost(`/sessions/${sessionId}/cancel`, { reason }, { throwOnError: true });
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
  return apiPut("/coaches/availability", { availability }, { throwOnError: true });
}

export async function updateAvailabilitySlot(
  slotId: string,
  data: {
    startTime?: string;
    endTime?: string;
    isAvailable?: boolean;
  }
) {
  return apiPut(`/coaches/availability/${slotId}`, data, { throwOnError: true });
}

export async function deleteAvailabilitySlot(slotId: string) {
  return apiDelete(`/coaches/availability/${slotId}`, { throwOnError: true });
}
