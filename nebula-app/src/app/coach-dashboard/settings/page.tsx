"use client";

import { useEffect, useState, useRef } from "react";
import { ProfileAvatar } from "./components/profile-avatar";
import { ProfileForm, ProfileFormData } from "./components/profile-form";
import {
  PayoutSettings,
  PayoutSettingsData,
} from "./components/payout-settings";
import { updateCoachProfile } from "@/actions/coaches";
import { uploadUserAvatar } from "@/actions/user";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, CreditCard } from "lucide-react";

export default function CoachSettingsPage() {
  const { profile, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isPayoutLoading, setIsPayoutLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, or WebP)");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const response = await uploadUserAvatar(file);

      if (response.success) {
        toast.success("Avatar updated successfully!");
        // Refresh the profile to get the new avatar URL
        await refreshUser();
      } else {
        toast.error(response.message || "Failed to upload avatar");
      }
    } catch (error) {
      toast.error("An unexpected error occurred while uploading");
    } finally {
      setIsUploadingAvatar(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
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

  const handlePayoutSave = async (payoutData: PayoutSettingsData) => {
    setIsPayoutLoading(true);
    try {
      // TODO: Implement payout settings save API
      console.log("Saving payout settings:", payoutData);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated delay
      toast.success("Payout settings saved successfully");
    } catch (error) {
      toast.error("Failed to save payout settings");
    } finally {
      setIsPayoutLoading(false);
    }
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and payout information
        </p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList>
          <TabsTrigger value="account" className="gap-2">
            <User className="h-4 w-4" />
            Account Settings
          </TabsTrigger>
          <TabsTrigger value="payout" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Payout Information
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-1">
              <ProfileAvatar
                avatarUrl={profile?.avatarUrl || undefined}
                fullName={profile?.fullName || ""}
                title={formData.title}
                onChangePhoto={handleChangePhoto}
                isUploading={isUploadingAvatar}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
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
        </TabsContent>

        <TabsContent value="payout">
          <div className="max-w-2xl">
            <PayoutSettings
              onSave={handlePayoutSave}
              isLoading={isPayoutLoading}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
