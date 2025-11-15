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
import { useAuthActions } from "@/context/auth-context";

export default function ForgotPasswordPage() {
  const { resetPassword, error, clearError } = useAuthActions();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    clearError();

    try {
      await resetPassword(email);
      setEmailSent(true);
    } catch (error) {
      // Error handled by auth provider
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="mx-auto grid w-[350px] gap-6">
          <Card className="border-none shadow-none">
            <CardHeader className="p-0 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-primary">
                Check your email
              </CardTitle>
              <CardDescription>
                We&apos;ve sent a password reset link to {email}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 mt-6">
              <div className="space-y-4 text-center text-sm text-muted-foreground">
                <p>
                  Click the link in your email to reset your password. If you
                  don&apos;t see it, check your spam folder.
                </p>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEmailSent(false)}
                    className="w-full"
                  >
                    Try different email
                  </Button>
                  <Link href="/login">
                    <Button variant="default" className="w-full">
                      Back to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
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
              Back to sign in
            </Link>
            <CardTitle className="text-3xl font-bold text-primary">
              Reset Password
            </CardTitle>
            <CardDescription>
              Enter your email address and we&apos;ll send you a link to reset
              your password.
            </CardDescription>
          </CardHeader>
          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-destructive text-sm">{error.message}</p>
            </div>
          )}
          <form onSubmit={handleResetPassword}>
            <CardContent className="grid gap-4 p-0 mt-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
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
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
