"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface ProfileAvatarProps {
  avatarUrl?: string;
  fullName: string;
  title: string;
  onChangePhoto?: () => void;
}

export function ProfileAvatar({
  avatarUrl,
  fullName,
  title,
  onChangePhoto,
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
        <Button className="w-full" onClick={onChangePhoto}>
          Change Photo
        </Button>
      </CardContent>
    </Card>
  );
}