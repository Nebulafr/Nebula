import { apiGet, apiPut } from "@/lib/utils";

export async function getUserProfile() {
  return apiGet("/users/profile");
}

export async function updateUserProfile(data: any) {
  return apiPut("/users/profile", data);
}
