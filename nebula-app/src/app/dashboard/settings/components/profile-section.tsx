"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, type UpdateProfileData } from "@/lib/validations";

interface ProfileSectionProps {
  user: {
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  onSave: (data: UpdateProfileData) => Promise<void>;
  onChangePhoto: () => void;
  isLoading?: boolean;
  isUploadingAvatar?: boolean;
}

export function ProfileSection({
  user,
  onSave,
  onChangePhoto,
  isLoading = false,
  isUploadingAvatar = false,
}: ProfileSectionProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: user.fullName,
      email: user.email,
    },
  });

  const onSubmit = async (data: UpdateProfileData) => {
    await onSave(data);
  };

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1">
        <Card>
          <CardHeader className="text-center">
            <div className="relative mx-auto mb-4 w-fit">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-white/50 hover:bg-white/70 backdrop-blur-sm"
                onClick={onChangePhoto}
                disabled={isUploadingAvatar}
              >
                {isUploadingAvatar ? (
                  <Loader2 className="h-4 w-4 animate-spin text-foreground" />
                ) : (
                  <Camera className="h-4 w-4 text-foreground" />
                )}
              </Button>
            </div>
            <h3 className="text-2xl font-semibold leading-none tracking-tight">
              {user.fullName}
            </h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </CardHeader>
          <CardContent className="text-center"></CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <h3 className="font-semibold leading-none tracking-tight">
              Profile Information
            </h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  {...register("fullName")}
                  className={errors.fullName ? "border-red-500" : ""}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500">{errors.fullName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className={errors.email ? "border-red-500" : ""}
                  disabled
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed for security reasons
                </p>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button type="submit" disabled={!isDirty || isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Profile"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
