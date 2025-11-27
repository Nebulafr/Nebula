import { Coach } from "@/generated/prisma";
import { apiPost, apiPut, apiGet } from "@/lib/utils";

export interface CreateCoachData {
  email: string;
  fullName: string;
  title: string;
  bio: string;
  style?: string;
  specialties: string[];
  pastCompanies?: string[];
  linkedinUrl?: string;
  availability: string;
  hourlyRate: number;
  qualifications?: string[];
  experience?: string;
  timezone?: string;
  languages?: string[];
}

export interface UpdateCoachProfileData {
  title: string;
  bio: string;
  style: string;
  specialties: string[];
  pastCompanies?: string[];
  linkedinUrl?: string;
  availability: string;
  hourlyRate: number;
  qualifications?: string[];
  experience?: string;
  timezone?: string;
  languages?: string[];
}

export interface CoachProfileResponse {
  success: boolean;
  data?: Coach;
  error?: string;
  message?: string;
}

export async function updateCoachProfile(
  profileData: UpdateCoachProfileData
): Promise<CoachProfileResponse> {
  try {
    const response = await apiPut("/coaches/profile", profileData);

    if (!response.success) {
      throw new Error(response.message || "Failed to update profile");
    }

    return {
      success: true,
      data: response.data,
      message: response.message,
    };
  } catch (error: any) {
    console.error("Error updating coach profile:", error);
    return {
      success: false,
      error: error.message || "Failed to update profile",
      message: error.message || "An unexpected error occurred",
    };
  }
}

export async function getCoachProfile(): Promise<CoachProfileResponse> {
  try {
    const response = await apiGet("/api/coaches/profile");

    if (!response.success) {
      throw new Error(response.message || "Failed to fetch profile");
    }

    return {
      success: true,
      data: response.data,
      message: response.message,
    };
  } catch (error: any) {
    console.error("Error fetching coach profile:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch profile",
      message: error.message || "An unexpected error occurred",
    };
  }
}

export async function createCoach(
  coachData: CreateCoachData
): Promise<CoachProfileResponse> {
  try {
    const profileData: UpdateCoachProfileData = {
      title: coachData.title,
      bio: coachData.bio,
      style: coachData.style || "",
      specialties: coachData.specialties,
      pastCompanies: coachData.pastCompanies || [],
      linkedinUrl: coachData.linkedinUrl || "",
      availability: coachData.availability,
      hourlyRate: coachData.hourlyRate,
      qualifications: coachData.qualifications || [],
      experience: coachData.experience || "",
      timezone:
        coachData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      languages: coachData.languages || ["English"],
    };

    const profileResponse = await updateCoachProfile(profileData);

    if (!profileResponse.success) {
      throw new Error(
        profileResponse.message || "Failed to update coach profile"
      );
    }

    return {
      success: true,
      data: profileResponse.data,
      message: "Coach profile created successfully",
    };
  } catch (error: any) {
    console.error("Error creating coach profile:", error);
    return {
      success: false,
      error: error.message || "Failed to create coach",
      message: error.message || "An unexpected error occurred",
    };
  }
}
