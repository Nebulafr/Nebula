 
"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { updateUserProfile, uploadUserAvatar, changePassword } from "@/actions/user";
import { toast } from "react-toastify";
import { ProfileSection } from "./components/profile-section";
import { SecuritySection } from "./components/security-section";
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
        await refreshUser();
      } else {
        toast.error(response.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (data: ChangePasswordData) => {
    setIsPasswordLoading(true);
    try {
      const response = await changePassword(data);

      if (response.success) {
        // Password changed successfully
      } else {
        toast.error(response.message || "Failed to change password");
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const isGoogleUser = !profile.hashedPassword && !!profile.googleId;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <ProfileSection
        user={{
          fullName: profile.fullName || "",
          email: profile.email,
          avatarUrl: profile.avatarUrl || undefined,
        }}
        previewUrl={previewUrl}
        onSave={handleSaveProfile}
        onChangePhoto={handleChangePhoto}
        onConfirmUpload={handleConfirmUpload}
        onCancelPreview={handleCancelPreview}
        isLoading={isLoading}
        isUploadingAvatar={isUploadingAvatar}
      />

      <SecuritySection
        onChangePassword={handleChangePassword}
        isLoading={isPasswordLoading}
        isGoogleUser={isGoogleUser}
      />
    </div>
  );
}
