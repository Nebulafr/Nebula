import { apiGet, apiPost } from "@/lib/utils";
import moment from "moment";
import { EnrollmentsResponse } from "@/types";

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
    date: date || moment().format("YYYY-MM-DD"),
    amountPaid,
  };

  return apiPost(`/programs/slug/${programSlug}/enroll`, enrollmentData);
}

export async function getEnrollments(status?: string): Promise<EnrollmentsResponse> {
  const query = status ? `?status=${status}` : "";
  return apiGet<EnrollmentsResponse["data"]>(`/students/enrollments${query}`) as Promise<EnrollmentsResponse>;
}
