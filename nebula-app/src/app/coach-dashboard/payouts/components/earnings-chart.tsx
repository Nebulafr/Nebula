"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

import { useTranslations } from "next-intl";

export interface EarningsData {
  month: string;
  earnings: number;
}

interface EarningsChartProps {
  data: EarningsData[];
  loading?: boolean;
}

export function EarningsChart({ data, loading = false }: EarningsChartProps) {
  const t = useTranslations("dashboard.coach.payouts");
  
  const chartConfig = {
    earnings: {
      label: t("earningsOverview"),
      color: "hsl(var(--primary))",
    },
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("earningsOverview")}</CardTitle>
          <CardDescription>{t("earningsDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-64 w-full bg-gray-200 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("earningsOverview")}</CardTitle>
        <CardDescription>{t("earningsDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-64 w-full">
          <BarChart data={data}>
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="earnings" fill="var(--color-earnings)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}