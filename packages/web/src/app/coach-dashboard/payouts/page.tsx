"use client";
import { useState } from "react";
import { EarningsChart } from "./components/earnings-chart";
import { AccountBalance } from "./components/account-balance";
import { PayoutHistory } from "./components/payout-history";
import { useTranslations } from "next-intl";
import { useStripeBalance, useCoachEarnings, useCoachPayouts } from "@/hooks/use-coach-queries";

export default function PayoutsPage() {
  const t = useTranslations("dashboard.coach.payouts");

  const { data: balanceData, isLoading: balanceLoading } = useStripeBalance();
  const { data: earningsData, isLoading: earningsLoading } = useCoachEarnings();
  const { data: payoutsData, isLoading: payoutsLoading } = useCoachPayouts(10);

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <EarningsChart
              data={earningsData || []}
              loading={earningsLoading}
            />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <AccountBalance
              balance={balanceData?.available || 0}
              loading={balanceLoading}
            />
          </div>
        </div>
      </div>

      <PayoutHistory
        payouts={payoutsData?.payouts || []}
        loading={payoutsLoading}
      />
    </div>
  );
}
