import { Coach, Student, User } from "@/generated/prisma";
import { apiGet, apiPut } from "@/lib/utils";

export const getUserProfile = async () => {
  try {
    const response = await apiGet<{
      user: User & { coach?: Coach; student?: Student };
    }>("/users/profile");

    return {
      success: response.success,
      data: response.data,
      message: response.message,
    };
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch user",
      message: error.message || "An unexpected error occurred",
    };
  }
};

export const updateUserProfile = async (data: any) => {
  try {
    const response = await apiPut("/users/profile", data);

    if (!response.success) {
      throw new Error(response.message || "Failed to update user");
    }

    return {
      success: true,
      data: response.data,
      message: response.message,
    };
  } catch (error: any) {
    console.error("Error updating users:", error);
    return {
      success: false,
      error: error.message || "Failed to update user",
      message: error.message || "An unexpected error occurred",
    };
  }
};
