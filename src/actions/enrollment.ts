import { apiPost } from "@/lib/utils";
import { createEnrollmentSchema, validateRequest } from "@/lib/validations";

export async function enrollInProgram({
  programId,
  programSlug,
  coachId,
  amountPaid,
  time,
  date,
}: {
  programId?: string;
  programSlug?: string;
  coachId: string;
  amountPaid: number;
  time: string;
  date?: string;
}) {
  try {
    const endpoint = programId
      ? `/programs/${programId}/enroll`
      : `/programs/${programSlug}/enroll`;

    const enrollmentData = {
      programId,
      coachId,
      amountPaid,
      time,
      date: date || new Date().toISOString().split("T")[0],
    };

    validateRequest(createEnrollmentSchema, {
      ...enrollmentData,
      studentId: "temp",
    });

    const response = await apiPost(endpoint, enrollmentData);

    if (!response.success) {
      throw new Error(
        response.error || response.message || "Failed to enroll in program"
      );
    }

    return {
      success: true,
      data: response.data,
      message: response.message || "Successfully enrolled in program",
    };
  } catch (error: any) {
    console.error("Error enrolling in program:", error);
    return {
      success: false,
      error: error.message || "Failed to enroll in program",
    };
  }
}
