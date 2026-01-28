"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useTranslations } from "next-intl";

interface AccountBalanceProps {
  balance: number;
  currency?: string;
  onRequestPayout?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function AccountBalance({
  balance,
  currency = "$",
  onRequestPayout,
  loading = false,
  disabled = false,
}: AccountBalanceProps) {
  const t = useTranslations("dashboard.coach.payouts");

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("accountBalance")}</CardTitle>
          <CardDescription>{t("balanceDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-12 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("accountBalance")}</CardTitle>
        <CardDescription>{t("balanceDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-4xl font-bold">
          {currency}{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <Button 
          className="w-full" 
          onClick={onRequestPayout}
          disabled={disabled || balance <= 0}
        >
          {balance <= 0 ? t("noBalance") : t("requestPayout")}
        </Button>
        {balance > 0 && (
          <p className="text-xs text-muted-foreground">
            {t("minPayout")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}