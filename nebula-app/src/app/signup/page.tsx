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
import { ArrowLeft, Eye, EyeOff, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { UserRole } from "@/generated/prisma";
import { toast } from "react-toastify";
import { AuthPageGuard } from "@/components/auth/protected-route";
import { useAuthActions } from "@/hooks/use-auth";
import { useTranslations } from "next-intl";
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

const signupFormSchema = signupSchema
  .extend({
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupFormSchema>;

export default function SignupPage() {
  const signupImage = PlaceHolderImages.find((img) => img.id === "coach-hero");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false);
  const { signUp, signInWithGoogle } = useAuthActions();
  const t = useTranslations("auth.signup");
  const f = useTranslations("auth.fields");
  const c = useTranslations("common");
  const tLogin = useTranslations("auth.login");

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      role: UserRole.STUDENT,
    },
  });

  const handleSignup = async (values: SignupFormValues) => {
    if (loading) return;

    setLoading(true);

    try {
      const response = await signUp({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        role: UserRole.STUDENT,
      });

      if (response.success) {
        setIsSignedUp(true);
        toast.success(response.message || "Please check your email to verify your account");
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message.toLowerCase() : "";
      if (errorMessage.includes("exists") || errorMessage.includes("already")) {
        toast.error(t("emailExists"));
      } else {
        toast.error(t("signupFailed"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const response = await signInWithGoogle(UserRole.STUDENT);
    } catch (error: any) {
      if (error?.message !== "Redirecting to Google sign-in...") {
        toast.error(t("googleSignupFailed"));
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
              quality={85}
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
              {isSignedUp ? (
                <div className="text-center space-y-6 py-8">
                  <div className="flex justify-center">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-3xl font-bold text-primary">
                      {t("checkEmail")}
                    </CardTitle>
                    <CardDescription className="text-base text-balance">
                      {t("checkEmailDesc", { email: form.getValues("email") })}
                    </CardDescription>
                  </div>
                  <div className="pt-4">
                    <Button asChild className="w-full" size="lg">
                      <Link href="/login">{t("backToLogin")}</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <CardHeader className="p-0 text-left">
                    <Link
                      href="/"
                      className="flex items-center gap-2 mb-4 text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      {tLogin("backToWebsite")}
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
                              <FormLabel>{t("fullName")}</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder={t("fullNamePlaceholder")}
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
                                <button
                                  type="button"
                                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </button>
                              </div>
                              <FormMessage />
                              <p className="text-xs text-muted-foreground">
                                {t("passwordHint")}
                              </p>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem className="grid gap-2 space-y-0">
                              <FormLabel>{f("confirmPassword")}</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="password"
                                  disabled={loading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          className="w-full"
                          size="lg"
                          disabled={loading}
                        >
                          {loading ? t("signingUp") : t("signUp")}
                        </Button>
                      </CardContent>
                    </form>
                  </Form>
                  <div className="relative mt-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        {tLogin("orContinueWith")}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    size="lg"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                  >
                    <GoogleIcon className="mr-2 h-5 w-5" />
                    {loading ? t("signingUp") : t("googleSignUp")}
                  </Button>
                </>
              )}
            </Card>
            <div className="mt-4 text-center text-sm">
              {t("hasAccount")}{" "}
              <Link href="/login" className="underline">
                {c("login")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthPageGuard>
  );
}
