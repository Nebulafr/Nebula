import { apiGet, apiPut } from "@/lib/utils";
import { uploadAvatarToCloudinary } from "@/lib/cloudinary";

export async function getUserProfile() {
  return apiGet("/users/profile");
}

export async function updateUserProfile(data: any) {
  return apiPut("/users/profile", data);
}

export async function uploadUserAvatar(file: File) {
  try {
    // Upload to Cloudinary
    const avatarUrl = await uploadAvatarToCloudinary(file);
    
    // Update user profile with new avatar URL
    const response = await updateUserProfile({ avatarUrl });
    
    if (response.success) {
      return {
        success: true,
        data: { avatarUrl },
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
