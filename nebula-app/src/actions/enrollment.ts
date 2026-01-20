import { apiGet, apiPost } from "@/lib/utils";

export async function enrollInProgram({
  programSlug,
  coachId,
  amountPaid,
  time,
  date,
}: {
  programSlug?: string;
  coachId: string;
  amountPaid: number;
  time: string;
  date?: string;
}) {
  const enrollmentData = {
    coachId,
    time,
    date: date || new Date().toISOString().split("T")[0],
    amountPaid,
  };

  return apiPost(`/programs/${programSlug}/enroll`, enrollmentData);
}

export async function getEnrollments(status?: string) {
  const query = status ? `?status=${status}` : "";
  return apiGet(`/students/enrollments${query}`);
}
  