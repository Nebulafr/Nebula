"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  changePasswordSchema,
  type ChangePasswordData,
} from "@/lib/validations";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useTranslations } from "next-intl";

interface SecuritySectionProps {
  onChangePassword: (data: ChangePasswordData) => Promise<void>;
  isLoading?: boolean;
  isGoogleUser?: boolean;
}

export function SecuritySection({
  onChangePassword,
  isLoading = false,
  isGoogleUser = false,
}: SecuritySectionProps) {
  const t = useTranslations("dashboard.settings.security");
  const commonT = useTranslations("signup");

  const form = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordData) => {
    await onChangePassword(data);
    form.reset();
  };

  if (isGoogleUser) {
    return (
      <Card>
        <CardHeader>
          <h3 className="font-semibold leading-none tracking-tight">
            {t("title")}
          </h3>
        </CardHeader>
        <CardContent className="space-y-6 mt-6">
          <div className="rounded-lg border border-muted p-4 text-center">
            <p className="text-sm text-muted-foreground">
              {t("googleUserNote")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
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
            <div className="space-y-4">
              <div>
                <FormLabel className="text-base font-semibold">
                  {t("passwordLabel")}
                </FormLabel>
                <p className="text-sm text-muted-foreground">
                  {t("passwordDescription")}
                </p>
              </div>

              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("currentPassword")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        className={
                          form.formState.errors.currentPassword
                            ? "border-red-500"
                            : ""
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("newPassword")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        className={
                          form.formState.errors.newPassword
                            ? "border-red-500"
                            : ""
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("confirmNewPassword")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        className={
                          form.formState.errors.confirmPassword
                            ? "border-red-500"
                            : ""
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("changingPassword")}
                    </>
                  ) : (
                    t("changePassword")
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
