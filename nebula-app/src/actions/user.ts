import { apiGet, apiPut, apiPost } from "@/lib/utils";
import { fileToBase64 } from "@/lib/upload";
import { ChangePasswordData, UpdateProfileData } from "@/lib/validations";
import { UserProfile } from "@/types";

export async function getUserProfile(): Promise<{ user: UserProfile }> {
  const response = await apiGet<{ user: UserProfile }>("/users/profile");
  if (response.success && response.data) return response.data;
  throw new Error(response.message || "Failed to fetch profile");
}

export async function updateUserProfile(data: UpdateProfileData) {
  return apiPut("/users/profile", data);
}

export async function changePassword(data: ChangePasswordData) {
  return apiPost("/users/change-password", data);
}

export async function uploadUserAvatar(file: File) {
  try {
    // Convert File to base64
    const base64Data = await fileToBase64(file);

    const response = await updateUserProfile({ avatarUrl: base64Data });

    if (response.success) {
      const updatedAvatarUrl = (response.data as any).user.avatarUrl;
      return {
        success: true,
        data: { avatarUrl: updatedAvatarUrl },
        message: "Avatar updated successfully"
      };
    } else {
      return {
        success: false,
        message: response.message || "Failed to update avatar"
      };
    }

  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to upload avatar"
    };
  }
}
