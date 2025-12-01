"use client";

import { useState } from "react";
import { EarningsChart, EarningsData } from "./components/earnings-chart";
import { AccountBalance } from "./components/account-balance";
import { PayoutHistory } from "./components/payout-history";
import { Payout } from "./components/payout-item";
import { toast } from "react-toastify";

const payouts = [
  { id: 'POUT-001', date: '2024-08-15', amount: 1999.00, status: 'Paid' },
  { id: 'POUT-002', date: '2024-07-15', amount: 390.00, status: 'Paid' },
  { id: 'POUT-003', date: '2024-06-15', amount: 1200.00, status: 'Paid' },
  { id: 'POUT-004', date: '2024-05-15', amount: 850.00, status: 'Paid' },
  { id: 'POUT-005', date: '2024-04-15', amount: 1500.00, status: 'Paid' },
];

const chartData = [
  { month: "March", earnings: 1860 },
  { month: "April", earnings: 1500 },
  { month: "May", earnings: 850 },
  { month: "June", earnings: 1200 },
  { month: "July", earnings: 390 },
  { month: "August", earnings: 1999 },
];

const chartConfig = {
  earnings: {
    label: "Earnings",
    color: "hsl(var(--primary))",
  },
};

export default function PayoutsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
             <CardHeader>
              <CardTitle>Earnings Overview</CardTitle>
              <CardDescription>Your earnings over the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="min-h-64 w-full">
                <BarChart data={chartData}>
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
        </div>
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Account Balance</CardTitle>
              <CardDescription>Your current available balance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-4xl font-bold">$2,350.75</p>
              <Button className="w-full">Request Payout</Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payout ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell className="font-medium">{payout.id}</TableCell>
                  <TableCell>{payout.date}</TableCell>
                  <TableCell>${payout.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={payout.status === 'Paid' ? 'secondary' : 'outline'} className={payout.status === 'Paid' ? 'bg-primary text-primary-foreground' : ''}>
                        {payout.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">View Details</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
