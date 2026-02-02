"use client";

import { useTranslations } from "next-intl";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, type UpdateProfileData } from "@/lib/validations";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface ProfileSectionProps {
  user: {
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  previewUrl?: string | null;
  onSave: (data: UpdateProfileData) => Promise<void>;
  onChangePhoto: () => void;
  onConfirmUpload?: () => Promise<void>;
  onCancelPreview?: () => void;
  isLoading?: boolean;
  isUploadingAvatar?: boolean;
}

export function ProfileSection({
  user,
  previewUrl,
  onSave,
  onChangePhoto,
  onConfirmUpload,
  onCancelPreview,
  isLoading = false,
  isUploadingAvatar = false,
}: ProfileSectionProps) {
  const t = useTranslations("dashboard.settings.profile");
  const avatarT = useTranslations("dashboard.settings.avatar");

  const form = useForm<UpdateProfileData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: user.fullName,
      email: user.email,
    },
  });

  const { isDirty } = form.formState;

  const onSubmit = async (data: UpdateProfileData) => {
    await onSave(data);
    form.reset(data);
  };

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1">
        <Card>
          <CardHeader className="text-center">
            <div className="relative mx-auto mb-4 w-fit">
              <Avatar className="h-24 w-24">
                <AvatarImage src={previewUrl || user.avatarUrl} />
                <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              {!previewUrl && (
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
              )}
            </div>
            {previewUrl ? (
              <div className="space-y-2 px-4">
                <Button
                  size="sm"
                  className="w-full"
                  onClick={onConfirmUpload}
                  disabled={isUploadingAvatar}
                >
                  {isUploadingAvatar ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {avatarT("uploading")}
                    </>
                  ) : (
                    avatarT("save")
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={onCancelPreview}
                  disabled={isUploadingAvatar}
                >
                  {avatarT("cancel")}
                </Button>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-semibold leading-none tracking-tight">
                  {user.fullName}
                </h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </>
            )}
          </CardHeader>
          <CardContent className="text-center"></CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <h3 className="font-semibold leading-none tracking-tight">
              {t("title")}
            </h3>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 mt-6"
              >
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fullName")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("email")}</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormDescription>{t("emailNote")}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />
                <div className="flex justify-end">
                  <Button type="submit" disabled={!isDirty || isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("saving")}
                      </>
                    ) : (
                      t("save")
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
