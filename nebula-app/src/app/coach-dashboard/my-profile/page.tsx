"use client";

import { useEffect, useState } from "react";
import { ProfileAvatar } from "./components/profile-avatar";
import { ProfileForm, ProfileFormData } from "./components/profile-form";
import { updateCoachProfile } from "@/actions/coaches";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/use-auth";

export default function CoachProfilePage() {
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    title: "",
    bio: "",
    style: "",
    specialties: [],
    pastCompanies: [],
    linkedinUrl: "",
    availability: "",
    hourlyRate: 0,
    qualifications: [],
    experience: "",
    timezone: "",
    languages: ["English"],
  });

  useEffect(() => {
    if (profile && profile.coach) {
      const coachProfile = profile.coach;
      setFormData({
        title: coachProfile.title || "",
        bio: coachProfile.bio || "",
        style: coachProfile.style || "",
        specialties: coachProfile.specialties || [],
        pastCompanies: coachProfile.pastCompanies || [],
        linkedinUrl: coachProfile.linkedinUrl || "",
        availability: coachProfile.availability || "",
        hourlyRate: coachProfile.hourlyRate || 0,
        qualifications: coachProfile.qualifications || [],
        experience: coachProfile.experience || "",
        timezone: coachProfile.timezone || "UTC",
        languages: coachProfile.languages || ["English"],
      });
    }
  }, [profile]);

  const handleFormDataChange = (data: Partial<ProfileFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleChangePhoto = () => {
    console.log("Change photo clicked");
    toast.info("Photo upload functionality coming soon!");
  };

  const handleSave = async () => {
    if (!profile) return;

    setIsLoading(true);
    try {
      const response = await updateCoachProfile(formData);

      if (response.success) {
        toast.success("Profile updated successfully");
      } else {
        toast.error(response.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
        <p className="text-muted-foreground">
          Manage your coaching profile and public information
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <ProfileAvatar
            avatarUrl={profile?.avatarUrl || undefined}
            fullName={profile?.fullName || ""}
            title={formData.title}
            onChangePhoto={handleChangePhoto}
          />
        </div>
        <div className="md:col-span-2">
          <ProfileForm
            formData={formData}
            onFormDataChange={handleFormDataChange}
            onSave={handleSave}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
