"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface ProfileAvatarProps {
  avatarUrl?: string;
  fullName: string;
  title: string;
  onChangePhoto?: () => void;
  isUploading?: boolean;
}

export function ProfileAvatar({
  avatarUrl,
  fullName,
  title,
  onChangePhoto,
  isUploading = false,
}: ProfileAvatarProps) {
  const t = useTranslations("dashboard.coach.settings.avatar");
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  return (
    <Card>
      <CardHeader className="text-center">
        <Avatar className="h-24 w-24 mx-auto mb-4">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>
            {initials || "C"}
          </AvatarFallback>
        </Avatar>
        <CardTitle>{fullName}</CardTitle>
        <CardDescription>{title}</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
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
      </CardContent>
    </Card>
  );
}