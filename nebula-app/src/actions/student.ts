import { apiGet, apiPut } from "@/lib/utils";

 
export async function updateStudentProfile(profileData: any) {
  return apiPut("/students/profile", profileData);
}

export async function getStudentProfile() {
  return apiGet("/students/profile");
}

 
export async function createStudent(studentData: any) {
  const profileData = {
    interestedCategoryIds: studentData.interestedCategoryIds,
    skillLevel: studentData.skillLevel,
    commitment: studentData.commitment,
    timeZone:
      studentData.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    learningGoals: studentData.learningGoals || [],
    country: studentData.country,
    countryIso: studentData.countryIso,
  };

  return updateStudentProfile(profileData);
}
