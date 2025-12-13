import { apiGet, apiPut } from "@/lib/utils";

export async function updateStudentProfile(profileData: any) {
  return apiPut("/students/profile", profileData);
}

export async function getStudentProfile() {
  return apiGet("/students/profile");
}

export async function createStudent(studentData: any) {
  const profileData = {
    interestedProgram: studentData.interestedProgram,
    skillLevel: studentData.skillLevel,
    commitment: studentData.commitment,
    timeZone:
      studentData.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    learningGoals: studentData.learningGoals || [],
  };

  return updateStudentProfile(profileData);
}
