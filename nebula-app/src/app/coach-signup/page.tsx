"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlaceHolderImages } from "@/lib/images/placeholder-images";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { UserRole } from "@/generated/prisma";
import { useTranslations } from "next-intl";
import { useAuthActions } from "@/hooks/use-auth";
import { AuthPageGuard } from "@/components/auth/protected-route";
import { handleAndToastError } from "@/lib/error-handler";
import { toast } from "react-toastify";
import { signupSchema } from "@/lib/validations";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="24px"
      height="24px"
      {...props}
    >
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      />
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.657-3.356-11.303-8H6.306C9.663,35.663,16.318,44,24,44z"
      />
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.012,36.49,44,30.638,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      />
    </svg>
  );
}

const coachSignupFormSchema = signupSchema
  .extend({
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type CoachSignupFormValues = z.infer<typeof coachSignupFormSchema>;

export default function CoachSignupPage() {
  const signupImage = PlaceHolderImages.find((img) => img.id === "about-story");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuthActions();
  const t = useTranslations("auth.coachSignup");
  const ts = useTranslations("auth.signup");
  const f = useTranslations("auth.fields");
  const tl = useTranslations("auth.login");
  const c = useTranslations("common");

  const form = useForm<CoachSignupFormValues>({
    resolver: zodResolver(coachSignupFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      role: UserRole.COACH,
    },
  });

  const handleSignup = async (values: CoachSignupFormValues) => {
    if (loading) return;

    setLoading(true);

    try {
      const response = await signUp({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        role: UserRole.COACH,
      });
    } catch (error: any) {
      handleAndToastError(
        error,
        ts("signingUp") === "Creating account..."
          ? "Failed to create account"
          : "Échec de la création du compte"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const response = await signInWithGoogle(UserRole.COACH);
    } catch (error: any) {
      if (error?.message !== "Redirecting to Google sign-in...") {
        handleAndToastError(error, tl("signingIn") === "Signing in..." ? "Failed to sign in with Google" : "Échec de la connexion avec Google");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageGuard>
      <div className="w-full min-h-screen lg:grid lg:grid-cols-5">
        <div className="relative hidden h-full bg-muted lg:col-span-3 lg:block">
          {signupImage && (
            <Image
              src={signupImage.imageUrl}
              alt={signupImage.description}
              fill
              className="object-cover"
              data-ai-hint={signupImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-8 left-8 text-white">
            <h2 className="text-4xl font-bold">
              {t("welcome")}
            </h2>
            <p className="mt-2 max-w-lg">
              {t("description")}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12 lg:col-span-2">
          <div className="mx-auto grid w-[350px] gap-6">
            <Card className="border-none shadow-none">
              <CardHeader className="p-0 text-left">
                <Link
                  href="/become-a-coach"
                  className="flex items-center gap-2 mb-4 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {tl("backToWebsite")}
                </Link>
                <CardTitle className="text-3xl font-bold text-primary">
                  {t("title")}
                </CardTitle>
                <CardDescription>
                  {t("subtitle")}
                </CardDescription>
              </CardHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSignup)}>
                  <CardContent className="grid gap-4 p-0 mt-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem className="grid gap-2 space-y-0">
                          <FormLabel>{ts("fullName")}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={ts("fullNamePlaceholder")}
                              disabled={loading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="grid gap-2 space-y-0">
                          <FormLabel>{f("email")}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder={f("emailPlaceholder")}
                              disabled={loading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="grid gap-2 space-y-0">
                          <FormLabel>{f("password")}</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                {...field}
                                type={showPassword ? "text" : "password"}
                                disabled={loading}
                                className="pr-10"
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem className="grid gap-2 space-y-0">
                          <FormLabel>{f("confirmPassword")}</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                {...field}
                                type={showPassword ? "text" : "password"}
                                disabled={loading}
                                className="pr-10"
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground">
                            {ts("passwordHint")}
                          </p>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? ts("signingUp") : t("signUp")}
                    </Button>
                  </CardContent>
                </form>
              </Form>
              <Button
                variant="outline"
                className="w-full mt-4"
                size="lg"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <GoogleIcon className="mr-2 h-5 w-5" />
                {loading ? ts("signingUp") : t("googleSignUp")}
              </Button>
            </Card>
            <div className="mt-4 text-center text-sm">
              {t("hasAccount")}{" "}
              <Link href="/coach-login" className="underline">
                {c("login")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthPageGuard>
  );
}
