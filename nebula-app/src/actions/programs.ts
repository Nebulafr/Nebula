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
    const validatedData = validateRequest(createProgramSchema, programData);
    const response = await apiPost("/programs", validatedData);

    return {
      success: true,
      data: { programId: response.data?.programId },
      message: response.message,
    };
  } catch (error: any) {
    console.error("Error creating program:", error);
    const errorDetails = error.response?.data || {};
    return {
      success: false,
      message: errorDetails.message || "Failed to create program",
      code: errorDetails.code,
      statusCode: errorDetails.statusCode,
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
    const errorDetails = error.response?.data || {};
    return {
      success: false,
      programs: [],
      error: errorDetails.message || "Failed to fetch programs",
      code: errorDetails.code,
      statusCode: errorDetails.statusCode,
    };
  }
}

export async function getActivePrograms(limit: number = 20) {
  try {
    const response = await getPrograms({ limit });

    if (!response.success) {
      throw new Error(response.error || "Failed to fetch programs");
    }

    return response.programs.map((program: any) => ({
      id: program.id,
      title: program.title,
      category: program.category,
      description: program.description,
      objectives: program.objectives,
      modules: program.modules,
      slug: program.slug,
      rating: program.rating || 0,
      totalReviews: program.totalReviews || 0,
      price: program.price || 0,
      duration: program.duration,
      difficultyLevel: program.difficultyLevel,
      maxStudents: program.maxStudents,
      currentEnrollments: program.currentEnrollments || 0,
      isActive: program.isActive,
      tags: program.tags || [],
      prerequisites: program.prerequisites || [],
      coachId: program.coachId,
      coachRef: program.coachRef,
      coachData: program.coachData,
      createdAt: program.createdAt ? new Date(program.createdAt) : new Date(),
      updatedAt: program.updatedAt ? new Date(program.updatedAt) : new Date(),
    }));
  } catch (error: any) {
    console.error("Error fetching active programs:", error);
    throw error;
  }
}

export async function getGroupedPrograms(
  limit: number = 20,
  category?: string
) {
  try {
    const searchParams = new URLSearchParams();
    if (limit) searchParams.set("limit", limit.toString());
    if (category) searchParams.set("category", category);
    const query = searchParams.toString() ? `?${searchParams}` : "";

    const response = await apiGet(`/programs${query}`, { requireAuth: false });

    if (!response.success) {
      throw new Error(response.error || "Failed to fetch programs");
    }

    // Return the pre-grouped data from the API
    return response.data?.groupedPrograms || [];
  } catch (error: any) {
    console.error("Error fetching grouped programs:", error);
    throw error;
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
    const errorDetails = error.response?.data || {};
    return {
      success: false,
      message: errorDetails.message || "Failed to update program",
      code: errorDetails.code,
      statusCode: errorDetails.statusCode,
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
    const errorDetails = error.response?.data || {};
    return {
      success: false,
      message: errorDetails.message || "Failed to delete program",
      code: errorDetails.code,
      statusCode: errorDetails.statusCode,
    };
  }
}

export async function getProgramBySlug(slug: string) {
  try {
    const response = await apiGet(`/programs/${slug}`, { requireAuth: false });

    if (!response.success) {
      throw new Error(response.error || "Failed to fetch program");
    }

    const program = response.data?.program;

    return {
      success: response.success,
      data: program,
      message: response.message,
    };
  } catch (error: any) {
    console.error("Error fetching program by slug:", error);
    const errorDetails = error.response?.data || {};
    return {
      success: false,
      message: errorDetails.message || "Failed to delete program",
      code: errorDetails.code,
      statusCode: errorDetails.statusCode,
    };
  }
}
