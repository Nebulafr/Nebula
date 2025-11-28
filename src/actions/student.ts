import { Student, SkillLevel } from "../generated/prisma";
import { apiPost, apiPut, apiGet } from "@/lib/utils";

export interface CreateStudentData {
  uid: string;
  email: string;
  fullName: string;
  interestedProgram: string;
  skillLevel: SkillLevel | string;
  commitment: string;
  timeZone?: string;
  learningGoals?: string[];
}

export interface UpdateStudentProfileData {
  interestedProgram: string;
  skillLevel: SkillLevel | string;
  commitment: string;
  timeZone?: string;
  learningGoals?: string[];
}

export interface StudentProfileResponse {
  success: boolean;
  data?: Student;
  error?: string;
  message?: string;
}

export async function updateStudentProfile(
  profileData: UpdateStudentProfileData
): Promise<StudentProfileResponse> {
  try {
    const response = await apiPut("/students/profile", profileData);

    if (!response.success) {
      throw new Error(response.message || "Failed to update profile");
    }

    return {
      success: true,
      data: response.data,
      message: response.message,
    };
  } catch (error: any) {
    console.error("Error updating student profile:", error);
    return {
      success: false,
      error: error.message || "Failed to update profile",
      message: error.message || "An unexpected error occurred",
    };
  }
}

export async function getStudentProfile(): Promise<StudentProfileResponse> {
  try {
    const response = await apiGet("/students/profile");

    return {
      success: response?.success!,
      data: response.data,
      message: response.message,
    };
  } catch (error: any) {
    console.error("Error fetching student profile:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch profile",
      message: error.message || "An unexpected error occurred",
    };
  }
}

export async function createStudent(
  studentData: CreateStudentData
): Promise<StudentProfileResponse> {
  try {
    const profileData: UpdateStudentProfileData = {
      interestedProgram: studentData.interestedProgram,
      skillLevel: studentData.skillLevel,
      commitment: studentData.commitment,
      timeZone:
        studentData.timeZone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      learningGoals: studentData.learningGoals || [],
    };

    const profileResponse = await updateStudentProfile(profileData);

    if (!profileResponse.success) {
      throw new Error(
        profileResponse.message || "Failed to update student profile"
      );
    }

    return {
      success: true,
      data: profileResponse.data,
      message: "Student profile created successfully",
    };
  } catch (error: any) {
    console.error("Error creating student profile:", error);
    return {
      success: false,
      error: error.message || "Failed to create student",
      message: error.message || "An unexpected error occurred",
    };
  }
}
