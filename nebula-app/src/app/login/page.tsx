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
import { useAuth } from "@/hooks/use-auth";
import { AuthPageGuard } from "@/components/auth/protected-route";
import { useTranslations } from "next-intl";
import { signinSchema } from "@/lib/validations";
import { z } from "zod";
import { toast } from "react-toastify";
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

export default function LoginPage() {
  const loginImage = PlaceHolderImages.find((img) => img.id === "coach-hero");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const t = useTranslations("auth.login");
  const f = useTranslations("auth.fields");

  const form = useForm<z.infer<typeof signinSchema>>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (values: z.infer<typeof signinSchema>) => {
    if (loading) return;

    setLoading(true);

    try {
      const response = await signIn({
        email: values.email,
        password: values.password,
      });
    } catch (error) {
      // Check if it's an invalid credentials error from the server
      const errorMessage = error instanceof Error ? error.message.toLowerCase() : "";
      if (errorMessage.includes("invalid") && (errorMessage.includes("email") || errorMessage.includes("password"))) {
        toast.error(t("invalidCredentials"));
      } else {
        toast.error(t("loginFailed"));
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
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Redirecting to Google sign-in..."
      ) {
        return;
      }
      toast.error(t("googleLoginFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageGuard>
      <div className="w-full min-h-screen lg:grid lg:grid-cols-5">
        <div className="relative hidden h-full bg-muted lg:col-span-3 lg:block">
          {loginImage && (
            <Image
              src={loginImage.imageUrl}
              alt={loginImage.description}
              fill
              className="object-cover"
              data-ai-hint={loginImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-8 left-8 text-white">
            <h2 className="text-4xl font-bold">{t("welcome")}</h2>
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
                  href="/"
                  className="flex items-center gap-2 mb-4 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t("backToWebsite")}
                </Link>
                <CardTitle className="text-3xl font-bold text-primary">
                  {t("title")}
                </CardTitle>
                <CardDescription>
                  {t("subtitle")}
                </CardDescription>
              </CardHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleLogin)}>
                  <CardContent className="grid gap-4 p-0 mt-6">
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
                          <div className="flex items-center">
                            <FormLabel>{f("password")}</FormLabel>
                            <Link
                              href="/forgot-password"
                              className="ml-auto inline-block text-sm underline hover:no-underline"
                            >
                              {f("forgotPassword")}
                            </Link>
                          </div>
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
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? t("signingIn") : t("signIn")}
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
                    {t("orContinueWith")}
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
                {loading ? t("signingIn") : t("googleSignIn")}
              </Button>
            </Card>
            <div className="mt-4 text-center text-sm">
              {t("noAccount")}{" "}
              <Link href="/signup" className="underline">
                {useTranslations("common")("signup")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthPageGuard>
  );
}
