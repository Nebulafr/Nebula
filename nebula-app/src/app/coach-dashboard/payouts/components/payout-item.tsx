"use client";

import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useTranslations, useLocale } from "next-intl";

export interface Payout {
  id: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Processing' | 'Failed';
  currency?: string;
  method?: string;
}

interface PayoutItemProps {
  payout: Payout;
  onViewDetails?: (payout: Payout) => void;
  onDownloadReceipt?: (payout: Payout) => void;
}

export function PayoutItem({
  payout,
  onViewDetails,
  onDownloadReceipt,
}: PayoutItemProps) {
  const t = useTranslations("dashboard.coach.payouts");
  const locale = useLocale();

  const getStatusColor = (status: Payout['status']) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{payout.id}</TableCell>
      <TableCell>{formatDate(payout.date)}</TableCell>
      <TableCell>
        {payout.currency || '$'}{payout.amount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </TableCell>
      <TableCell>
        <Badge className={getStatusColor(payout.status)}>
          {payout.status}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex gap-2 justify-end">
          {payout.status === 'Paid' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDownloadReceipt?.(payout)}
            >
              {t("downloadReceipt")}
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onViewDetails?.(payout)}
          >
            {t("viewDetails")}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}