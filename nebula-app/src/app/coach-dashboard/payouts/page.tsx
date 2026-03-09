 
"use client";
import { useState } from "react";
import { EarningsChart } from "./components/earnings-chart";
import { AccountBalance } from "./components/account-balance";
import { PayoutHistory } from "./components/payout-history";
import { StripeConnect } from "./components/stripe-connect";
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
  const [isConnected, setIsConnected] = useState(false);
  
  const chartData = [
    { month: "Mar", earnings: 1860 },
    { month: "Apr", earnings: 1500 },
    { month: "May", earnings: 850 },
    { month: "Jun", earnings: 1200 },
    { month: "Jul", earnings: 390 },
    { month: "Aug", earnings: 1999 },
  ];

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <EarningsChart data={chartData} />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <AccountBalance 
              balance={2350.75} 
              disabled={!isConnected}
            />
            <StripeConnect onStatusChange={setIsConnected} />
          </div>
        </div>
      </div>
      
      <PayoutHistory payouts={payouts} />
    </div>
  );
}
