"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface ProfileAvatarProps {
  avatarUrl?: string;
  previewUrl?: string; // New prop for preview
  fullName: string;
  title: string;
  onChangePhoto?: () => void;
  onSave?: () => void; // New callback for saving
  onCancel?: () => void; // New callback for cancelling
  isUploading?: boolean;
}

export function ProfileAvatar({
  avatarUrl,
  previewUrl,
  fullName,
  title,
  onChangePhoto,
  onSave,
  onCancel,
  isUploading = false,
}: ProfileAvatarProps) {
  const t = useTranslations("dashboard.coach.settings.avatar");
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const currentDisplayUrl = previewUrl || avatarUrl;

  return (
    <Card>
      <CardHeader className="text-center">
        <Avatar className="h-24 w-24 mx-auto mb-4">
          <AvatarImage src={currentDisplayUrl} />
          <AvatarFallback>
            {initials || "C"}
          </AvatarFallback>
        </Avatar>
        <CardTitle>{fullName}</CardTitle>
        <CardDescription>{title}</CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {!previewUrl ? (
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={onChangePhoto}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t("uploading")}
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                {t("change")}
              </>
            )}
          </Button>
        ) : (
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              className="w-full"
              onClick={onSave}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t("uploading")}
                </>
              ) : (
                t("save")
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={onCancel}
              disabled={isUploading}
            >
              {t("cancel")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}