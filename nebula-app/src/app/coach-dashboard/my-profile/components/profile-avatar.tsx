"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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
  return (
    <Card>
      <CardHeader className="text-center">
        <Avatar className="h-24 w-24 mx-auto mb-4">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>
            {fullName?.charAt(0) || "C"}
          </AvatarFallback>
        </Avatar>
        <CardTitle>{fullName}</CardTitle>
        <CardDescription>{title}</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button 
          className="w-full" 
          onClick={onChangePhoto}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            "Change Photo"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}