"use client";

import { useState } from "react";
import { EarningsChart } from "./components/earnings-chart";
import { AccountBalance } from "./components/account-balance";
import { PayoutHistory } from "./components/payout-history";
import { useTranslations } from "next-intl";

const payouts = [
  { id: 'POUT-001', date: '2024-08-15', amount: 1999.00, status: 'Paid' as const },
  { id: 'POUT-002', date: '2024-07-15', amount: 390.00, status: 'Paid' as const },
  { id: 'POUT-003', date: '2024-06-15', amount: 1200.00, status: 'Paid' as const },
  { id: 'POUT-004', date: '2024-05-15', amount: 850.00, status: 'Paid' as const },
  { id: 'POUT-005', date: '2024-04-15', amount: 1500.00, status: 'Paid' as const },
];

export default function PayoutsPage() {
  const t = useTranslations("dashboard.coach.payouts");
  
  const chartData = [
    { month: "Mar", earnings: 1860 },
    { month: "Apr", earnings: 1500 },
    { month: "May", earnings: 850 },
    { month: "Jun", earnings: 1200 },
    { month: "Jul", earnings: 390 },
    { month: "Aug", earnings: 1999 },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <EarningsChart data={chartData} />
        </div>
        <div className="md:col-span-1">
          <AccountBalance balance={2350.75} />
        </div>
      </div>
      <PayoutHistory payouts={payouts} />
    </div>
  );
}
