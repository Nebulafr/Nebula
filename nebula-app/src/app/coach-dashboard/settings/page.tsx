"use client";

import { useEffect, useState, useRef } from "react";
import { ProfileAvatar } from "./components/profile-avatar";
import { ProfileForm, ProfileFormData } from "./components/profile-form";
import {
  PayoutSettings,
  PayoutSettingsData,
} from "./components/payout-settings";
import { updateCoachProfile } from "@/actions/coaches";
import { uploadUserAvatar, changePassword } from "@/actions/user";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, CreditCard, Shield } from "lucide-react";
import { SecuritySection } from "@/app/dashboard/settings/components/security-section";
import { type ChangePasswordData } from "@/lib/validations";
import { useTranslations } from "next-intl";

export default function CoachSettingsPage() {
  const t = useTranslations("dashboard.coach.settings");
  const { profile, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isPayoutLoading, setIsPayoutLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: "",
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
        fullName: profile.fullName || "",
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error(t("avatar.errorFileType"));
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error(t("avatar.errorFileSize"));
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewFile(file);
    setPreviewUrl(url);

    // Clear the file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConfirmUpload = async () => {
    if (!previewFile) return;

    setIsUploadingAvatar(true);
    try {
      const response = await uploadUserAvatar(previewFile);

      if (response.success) {
        await refreshUser();
        toast.success(t("avatar.uploadSuccess"));
        handleCancelPreview();
      } else {
        toast.error(response.message || t("avatar.uploadError"));
      }
    } catch (error) {
      toast.error(t("errorUnexpected"));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCancelPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSave = async (data: ProfileFormData) => {
    if (!profile) return;

    setIsLoading(true);
    try {
      const response = await updateCoachProfile(data);

      if (response.success) {
        // Profile updated successfully
        toast.success(t("profile.saveSuccess") || "Profile updated");
        await refreshUser(); // Refresh user to get updated coach data
      } else {
        toast.error(response.message || t("profile.errorUpdate"));
      }
    } catch (error) {
      toast.error(t("profile.errorUnexpected") || t("errorUnexpected"));
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
      toast.success(t("payout.saveSuccess") || "Payout settings saved");
    } catch (error) {
      toast.error(t("payout.errorSave"));
    } finally {
      setIsPayoutLoading(false);
    }
  };

  const handleChangePassword = async (data: ChangePasswordData) => {
    setIsPasswordLoading(true);
    try {
      const response = await changePassword(data);

      if (response.success) {
        // Password changed successfully
        toast.success(t("security.passwordSuccess") || "Password changed");
      } else {
        toast.error(response.message || t("security.errorPassword"));
      }
    } catch (error: any) {
      toast.error(error.message || t("errorUnexpected"));
    } finally {
      setIsPasswordLoading(false);
    }
  };

  if (!profile) {
    return <div>{t("loading")}</div>;
  }

  const isGoogleUser = !profile.hashedPassword && !!profile.googleId;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList>
          <TabsTrigger value="account" className="gap-2">
            <User className="h-4 w-4" />
            {t("tabs.account")}
          </TabsTrigger>
          <TabsTrigger value="payout" className="gap-2">
            <CreditCard className="h-4 w-4" />
            {t("tabs.payout")}
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            {t("tabs.security")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-1">
              <ProfileAvatar
                avatarUrl={profile?.avatarUrl || undefined}
                previewUrl={previewUrl || undefined}
                fullName={profile?.fullName || ""}
                title={formData.title}
                onChangePhoto={handleChangePhoto}
                onSave={handleConfirmUpload}
                onCancel={handleCancelPreview}
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

        <TabsContent value="security">
          <div className="max-w-2xl">
            <SecuritySection
              onChangePassword={handleChangePassword}
              isLoading={isPasswordLoading}
              isGoogleUser={isGoogleUser}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
