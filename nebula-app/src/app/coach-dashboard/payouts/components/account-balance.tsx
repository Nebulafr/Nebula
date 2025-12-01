"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Balance</CardTitle>
          <CardDescription>Your current available balance.</CardDescription>
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
        <CardTitle>Account Balance</CardTitle>
        <CardDescription>Your current available balance.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-4xl font-bold">
          {currency}{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <Button 
          className="w-full" 
          onClick={onRequestPayout}
          disabled={disabled || balance <= 0}
        >
          {balance <= 0 ? "No Balance Available" : "Request Payout"}
        </Button>
        {balance > 0 && (
          <p className="text-xs text-muted-foreground">
            Minimum payout amount: $50.00
          </p>
        )}
      </CardContent>
    </Card>
  );
}