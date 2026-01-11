"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, type ChangePasswordData } from "@/lib/validations";

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
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordData) => {
    await onChangePassword(data);
    reset();
  };

  if (isGoogleUser) {
    return (
      <Card>
        <CardHeader>
          <h3 className="font-semibold leading-none tracking-tight">Security</h3>
        </CardHeader>
        <CardContent className="space-y-6 mt-6">
          <div className="rounded-lg border border-muted p-4 text-center">
            <p className="text-sm text-muted-foreground">
              You signed in with Google. Password management is handled by your
              Google account.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold leading-none tracking-tight">Security</h3>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <div className="space-y-4">
            <div>
              <Label>Password</Label>
              <p className="text-sm text-muted-foreground">
                Update your password here. Please choose a strong one.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                {...register("currentPassword")}
                className={errors.currentPassword ? "border-red-500" : ""}
              />
              {errors.currentPassword && (
                <p className="text-sm text-red-500">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                {...register("newPassword")}
                className={errors.newPassword ? "border-red-500" : ""}
              />
              {errors.newPassword && (
                <p className="text-sm text-red-500">{errors.newPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Changing Password...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
