 
"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Loading } from "@/components/shared/loading";
import { updateUserProfile, uploadUserAvatar, changePassword } from "@/actions/user";
import { toast } from "react-toastify";
import { ProfileSection } from "./components/profile-section";
import { SecuritySection } from "./components/security-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, CreditCard } from "lucide-react";
import { type UpdateProfileData, type ChangePasswordData } from "@/lib/validations";
import { useTranslations } from "next-intl";

export default function StudentSettingsPage() {
  const t = useTranslations("dashboard.settings");
  const { profile, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Clear the file input
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
        toast.success(t("avatar.uploadSuccess"));
        await refreshUser();
        handleCancelPreview();
      } else {
        toast.error(response.message || t("avatar.uploadError"));
      }
    } catch (error) {
      toast.error(t("errorUnexpected") || "An unexpected error occurred while uploading");
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
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSaveProfile = async (data: UpdateProfileData) => {
    setIsLoading(true);
    try {
      const response = await updateUserProfile(data);

      if (response.success) {
        toast.success(t("profile.success") || "Profile updated successfully");
        await refreshUser();
      } else {
        toast.error(response.message || t("profile.error") || "Failed to update profile");
      }
    } catch (error) {
      toast.error(t("errorUnexpected") || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (data: ChangePasswordData) => {
    setIsPasswordLoading(true);
    try {
      const response = await changePassword(data);

      if (response.success) {
        toast.success(t("security.passwordSuccess") || "Password changed successfully");
      } else {
        toast.error(response.message || t("security.errorPassword") || "Failed to change password");
      }
    } catch (error: any) {
      toast.error(error.message || t("errorUnexpected") || "An unexpected error occurred");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  if (!profile) {
    return <Loading fullPage message={t("loading")} />;
  }

  const isGoogleUser = !profile.hashedPassword && !!profile.googleId;

  let firstName = profile.firstName;
  let lastName = profile.lastName;

  // Fallback: extract from fullName if firstName or lastName are missing
  if ((!firstName || !lastName) && profile.fullName) {
    const parts = profile.fullName.trim().split(/\s+/);
    firstName = firstName || parts[0] || "";
    lastName = lastName || (parts.length > 1 ? parts.slice(1).join(" ") : "");
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
        <p className="text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            {t("tabs.profile")}
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            {t("tabs.security")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <ProfileSection
            user={{
              firstName: firstName || "",
              lastName: lastName || "",
              fullName: profile.fullName || "",
              email: profile.email,
              avatarUrl: profile.avatarUrl || undefined,
              country: profile.country || undefined,
              countryIso: profile.countryIso || undefined,
              interestedCategoryIds: (profile as any).student?.interestedCategoryIds || [],
            }}
            previewUrl={previewUrl}
            onSave={handleSaveProfile}
            onChangePhoto={handleChangePhoto}
            onConfirmUpload={handleConfirmUpload}
            onCancelPreview={handleCancelPreview}
            isLoading={isLoading}
            isUploadingAvatar={isUploadingAvatar}
          />
        </TabsContent>

        <TabsContent value="security" className="max-w-2xl">
          <SecuritySection
            onChangePassword={handleChangePassword}
            isLoading={isPasswordLoading}
            isGoogleUser={isGoogleUser}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
