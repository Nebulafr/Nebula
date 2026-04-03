"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatUserName, getInitials } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { AdminTransaction } from "@/hooks/use-admin-queries";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

interface TransactionDetailsModalProps {
  transaction: AdminTransaction | null;
  isOpen: boolean;
  onClose: () => void;
}

function getStatusVariant(status: string) {
  switch (status.toUpperCase()) {
    case "COMPLETED":
      return "secondary";
    case "FAILED":
      return "destructive";
    case "PENDING":
      return "outline";
    default:
      return "outline";
  }
}

function getStatusClassName(status: string) {
  return status.toUpperCase() === "COMPLETED" ? "bg-green-100 text-green-800" : "";
}

export function TransactionDetailsModal({
  transaction,
  isOpen,
  onClose,
}: TransactionDetailsModalProps) {
  const { toast } = useToast();
  const t = useTranslations("dashboard.admin");
  const tc = useTranslations("common");

  if (!transaction) return null;

  const displayName = formatUserName(transaction.user.fullName);
  const initials = getInitials(transaction.user.fullName);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: "Copied to clipboard",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("transactionDetails")}</DialogTitle>
          <DialogDescription>
            {t("transactionId")}: {transaction.id}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 ml-1"
              onClick={() => copyToClipboard(transaction.id)}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* User Info */}
          <div className="flex items-center gap-4 p-3 border rounded-lg bg-slate-50">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={transaction.user.avatarUrl || undefined}
              />
              <AvatarFallback name={transaction.user.fullName || undefined}>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{displayName}</p>
              <p className="text-sm text-muted-foreground truncate">{transaction.user.email}</p>
            </div>
            <Badge variant="outline" className="capitalize">
              {transaction.user.id.substring(0, 8)}...
            </Badge>
          </div>

          {/* Transaction Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("type")}
              </p>
              <p className="font-medium capitalize">{transaction.type.toLowerCase()}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("status")}
              </p>
              <div>
                <Badge
                  variant={getStatusVariant(transaction.status)}
                  className={getStatusClassName(transaction.status)}
                >
                  {transaction.status}
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("amount")}
              </p>
              <p className="text-xl font-bold">
                €{(transaction.amount / 100).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("date")}
              </p>
              <p className="font-medium">
                {new Date(transaction.createdAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>

          {/* Source Info */}
          <div className="space-y-3 p-4 border rounded-lg">
            <div className="flex justify-between items-center">
              <p className="text-sm font-semibold">{t("source")}</p>
              <Badge variant="secondary">{transaction.sourceType}</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("sourceId")}</span>
                <span className="font-mono text-xs flex items-center gap-1">
                  {transaction.sourceId}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4"
                    onClick={() => copyToClipboard(transaction.sourceId)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </span>
              </div>
              {transaction.description && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">{t("description")}</span>
                  <p className="text-sm italic text-muted-foreground">
                    &quot;{transaction.description}&quot;
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose}>
            {t("close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
