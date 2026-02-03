"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { verifyEmail } from "@/actions/auth";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const t = useTranslations("auth.verifyEmail");
  const router = useRouter();

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setErrorMessage("missingToken");
        setStatus("error");
        return;
      }

      try {
        const response = await verifyEmail(token);
        if (response.success) {
          setStatus("success");
        } else {
          setErrorMessage("verificationFailed");
          setStatus("error");
        }
      } catch (error: any) {
        setErrorMessage(error?.message || "verificationFailed");
        setStatus("error");
      }
    };

    verifyToken();
  }, [token]);

  // Show toast when error occurs
  useEffect(() => {
    if (status === "error" && errorMessage) {
      // Check if it's a translation key or a custom message
      const message = errorMessage === "missingToken" || errorMessage === "verificationFailed" 
        ? t(errorMessage) 
        : errorMessage;
      toast.error(message);
    }
  }, [status, errorMessage, t]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4 py-12">
      <Card className="w-full max-w-md border-none shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">
            {status === "loading" && t("title")}
            {status === "success" && t("success")}
            {status === "error" && t("error")}
          </CardTitle>
          <CardDescription>
            {status === "loading" && t("subtitle")}
            {status === "success" && t("successDesc")}
            {status === "error" && t("errorDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6 pb-8">
          {status === "loading" && (
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          )}
          {status === "success" && (
            <CheckCircle2 className="h-16 w-16 text-teal-600" />
          )}
          {status === "error" && (
            <XCircle className="h-16 w-16 text-destructive" />
          )}

          <div className="w-full pt-4">
            <Button asChild className="w-full" size="lg">
              <Link href="/login">{t("backToLogin")}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4 py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
