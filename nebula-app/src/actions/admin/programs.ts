import { makeRequest } from "@/lib/utils";
import { AdminProgramsResponse, ProgramActionResponse } from "@/types/program";

export async function getAdminPrograms(filters?: {
  status?: string;
  category?: string;
  search?: string;
}): Promise<AdminProgramsResponse> {
  try {
    const params = new URLSearchParams();

    if (filters?.status && filters.status !== "all") {
      params.append("status", filters.status);
    }
    if (filters?.category && filters.category !== "all") {
      params.append("category", filters.category);
    }
    if (filters?.search) {
      params.append("search", filters.search);
    }

    const url = `/admin/programs${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    const response = await makeRequest(url, "GET", {
      requireAuth: true,
    });

    return {
      success: true,
      data: response.data,
      message: response.message,
    };
  } catch (error: any) {
    console.error("Error fetching admin programs:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch programs",
      message: error.message || "An unexpected error occurred",
    };
  }
}

export async function updateProgramStatus(
  programId: string,
  action: "activate" | "deactivate",
  reason?: string
): Promise<ProgramActionResponse> {
  try {
    const url = `/admin/programs/${programId}/actions`;
    const response = await makeRequest(url, "POST", {
      body: { action, reason },
      requireAuth: true,
    });

    return {
      success: true,
      message: response.message,
    };
  } catch (error: any) {
    console.error("Error updating program status:", error);
    return {
      success: false,
      error: error.message || "Failed to update program status",
    };
  }
}

export async function activateProgram(
  programId: string,
  reason?: string
): Promise<ProgramActionResponse> {
  return updateProgramStatus(programId, "activate", reason);
}

export async function deactivateProgram(
  programId: string,
  reason?: string
): Promise<ProgramActionResponse> {
  return updateProgramStatus(programId, "deactivate", reason);
}
