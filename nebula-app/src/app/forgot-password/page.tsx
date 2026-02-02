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
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { handleAndToastError } from "@/lib/error-handler";
import { useTranslations } from "next-intl";

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const t = useTranslations("auth.forgotPassword");
  const f = useTranslations("auth.fields");
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      await requestPasswordReset(email);
      setEmailSent(true);
    } catch (error) {
      handleAndToastError(error, t("sending") === "Sending..." ? "Failed to send reset link" : "Échec de l'envoi du lien");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="mx-auto grid w-[350px] gap-6">
          <Card className="border-none shadow-none">
            <div className="mx-auto w-[400px] text-center">
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-primary/10 p-3">
                  <span className="text-2xl">📧</span>
                </div>
              </div>
              <h1 className="mb-2 text-3xl font-bold text-primary">
                {t("checkEmail.title")}
              </h1>
              <p className="mb-6 text-muted-foreground">
                {t("checkEmail.subtitle", { email })}
              </p>
              <div className="rounded-lg bg-muted p-6 text-left text-sm text-muted-foreground">
                {t("checkEmail.description")}
              </div>
              <div className="mt-8 flex flex-col gap-3">
                <Button
                  variant="outline"
                  onClick={() => setEmailSent(false)}
                  className="w-full"
                >
                  {t("checkEmail.tryDifferent")}
                </Button>
                <Link href="/login">
                  <Button variant="link" className="w-full hover:no-underline">
                    {t("checkEmail.backToSignIn")}
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="mx-auto grid w-[350px] gap-6">
        <Card className="border-none shadow-none">
          <CardHeader className="p-0 text-left">
            <Link
              href="/login"
              className="flex items-center gap-2 mb-4 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("backToSignIn")}
            </Link>
            <CardTitle className="text-3xl font-bold text-primary">
              {t("title")}
            </CardTitle>
            <CardDescription>
              {t("subtitle")}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleResetPassword}>
            <CardContent className="grid gap-4 p-0 mt-6">
              <div className="grid gap-2">
                <Label htmlFor="email">{f("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={f("emailPlaceholder")}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? t("sending") : t("sendLink")}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
