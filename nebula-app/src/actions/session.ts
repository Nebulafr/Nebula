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
  const sessionData = {
    coachId,
    date: date.toISOString(),
    startTime: time,
    duration,
  };

  return apiPost(`/coaches/${coachId}/book`, sessionData);
}
