"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from "@/components/ui/table";
import { PayoutItem, Payout } from "./payout-item";

interface PayoutHistoryProps {
  payouts: Payout[];
  onViewDetails?: (payout: Payout) => void;
  onDownloadReceipt?: (payout: Payout) => void;
  loading?: boolean;
}

export function PayoutHistory({
  payouts,
  onViewDetails,
  onDownloadReceipt,
  loading = false,
}: PayoutHistoryProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex gap-4 flex-1">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payout History</CardTitle>
        {payouts.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {payouts.length} payout{payouts.length !== 1 ? 's' : ''} found
          </p>
        )}
      </CardHeader>
      <CardContent>
        {payouts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No payouts yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your payout history will appear here once you receive your first payment.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payout ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((payout) => (
                <PayoutItem
                  key={payout.id}
                  payout={payout}
                  onViewDetails={onViewDetails}
                  onDownloadReceipt={onDownloadReceipt}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}