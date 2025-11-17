import { apiPost, apiGet, apiPut, apiDelete } from "@/lib/utils";
import { ApiResponse } from "@/types";
import {
  createProgramSchema,
  validateRequest,
  type CreateProgramData,
} from "@/lib/validations";

export async function createProgram(
  programData: CreateProgramData
): Promise<ApiResponse<{ programId?: string }>> {
  try {
    console.log({ programData });
    const validatedData = validateRequest(createProgramSchema, programData);
    const response = await apiPost("/programs", validatedData);

    return {
      success: true,
      data: { programId: response.data?.programId },
      message: response.message,
    };
  } catch (error: any) {
    console.error("Error creating program:", error);
    return {
      success: false,
      message: error.message || "Failed to create program",
    };
  }
}

export async function getPrograms(params?: {
  coachId?: string;
  category?: string;
  limit?: number;
}) {
  try {
    const searchParams = new URLSearchParams();

    if (params?.coachId) searchParams.set("coachId", params.coachId);
    if (params?.category) searchParams.set("category", params.category);
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    const query = searchParams.toString() ? `?${searchParams}` : "";
    const response = await apiGet(`/programs${query}`, { requireAuth: false });

    return {
      success: true,
      programs: response.data?.programs || [],
      pagination: response.data?.pagination,
    };
  } catch (error: any) {
    console.error("Error fetching programs:", error);
    return {
      success: false,
      programs: [],
      error: error.message,
    };
  }
}

export async function updateProgram(
  programId: string,
  updateData: Partial<CreateProgramData>
) {
  try {
    const response = await apiPut(`/programs/${programId}`, updateData);

    return {
      success: true,
      message: response.message,
    };
  } catch (error: any) {
    console.error("Error updating program:", error);
    return {
      success: false,
      message: error.message || "Failed to update program",
    };
  }
}

export async function deleteProgram(programId: string) {
  try {
    const response = await apiDelete(`/programs/${programId}`);

    return {
      success: true,
      message: response.message,
    };
  } catch (error: any) {
    console.error("Error deleting program:", error);
    return {
      success: false,
      message: error.message || "Failed to delete program",
    };
  }
}
