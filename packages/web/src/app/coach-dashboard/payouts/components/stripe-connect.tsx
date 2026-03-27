"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { onboardStripeAccount } from "@/actions/stripe";
import { useAuth } from "@/hooks";
import { useStripeStatus } from "@/hooks/use-coach-queries";

interface StripeConnectProps {
  onStatusChange?: (connected: boolean) => void;
}

export function StripeConnect({ onStatusChange }: StripeConnectProps) {
  const t = useTranslations("dashboard.coach.payouts");
  const { profile } = useAuth();
  
  const { data: status, isLoading: loading } = useStripeStatus();
  const [onboardingLoading, setOnboardingLoading] = useState(false);

  useEffect(() => {
    if (status && onStatusChange) {
      onStatusChange(status.isConnected && status.payoutsEnabled);
    }
  }, [status, onStatusChange]);

  const handleOnboard = async () => {
    if (profile && (!profile.country || !profile.countryIso)) {
      toast.error("Please add your country to your profile");
      return;
    }

    setOnboardingLoading(true);
    try {
      const returnUrl = window.location.href;
      const refreshUrl = window.location.href;

      const data = await onboardStripeAccount(returnUrl, refreshUrl);
      if (data.success && data.data.url) {
        window.location.href = data.data.url;
      } else {
        toast.error(data.message || "Failed to start onboarding");
      }
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setOnboardingLoading(true); // Keep loading state until redirect
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-10 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const isFullyConnected = status?.isConnected && status?.payoutsEnabled;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            Stripe Connect
            {isFullyConnected ? (
              <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Active
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                Action Required
              </Badge>
            )}
          </CardTitle>
        </div>
        <CardDescription>
          {isFullyConnected
            ? "Your account is fully set up to receive payouts."
            : "Complete your Stripe setup to start receiving payouts for your coaching sessions."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isFullyConnected ? (
          <Button
            className="w-full"
            onClick={handleOnboard}
            disabled={onboardingLoading}
          >
            {onboardingLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="mr-2 h-4 w-4" />
            )}
            {status?.isConnected ? "Complete Stripe Setup" : "Connect Stripe Account"}
          </Button>
        ) : (
          <div className="text-sm font-medium text-green-600 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Payouts are enabled and will be sent to your bank account.
          </div>
        )}

        {status?.requirements && status.requirements.length > 0 && (
          <div className="mt-4 p-3 bg-destructive/10 rounded-lg text-xs text-destructive flex gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold mb-1">Missing requirements:</p>
              <ul className="list-disc list-inside space-y-1">
                {status.requirements.map((req: string, i: number) => (
                  <li key={i}>{req.replace(/_/g, " ")}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
