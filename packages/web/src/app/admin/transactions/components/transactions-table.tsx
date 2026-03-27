"use client";

import { useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ArrowUpRight, ArrowDownLeft, RefreshCcw } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatUserName, getInitials, getDefaultAvatar } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { AdminPagination } from "../../components/admin-pagination";
import { AdminTransaction } from "@/hooks/use-admin-queries";
import { TransactionDetailsModal } from "./transaction-details-modal";

interface TransactionsTableProps {
  transactions: AdminTransaction[];
  loading?: boolean;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  page: number;
  limit: number;
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

function getTypeIcon(type: string) {
  switch (type.toUpperCase()) {
    case "EARNING":
      return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
    case "PAYOUT":
      return <ArrowUpRight className="h-4 w-4 text-blue-600" />;
    case "REFUND":
      return <RefreshCcw className="h-4 w-4 text-red-600" />;
    default:
      return null;
  }
}

export function TransactionsTable({
  transactions,
  loading = false,
  pagination,
  onPageChange,
  page,
  limit,
}: TransactionsTableProps) {
  const t = useTranslations("dashboard.admin");
  const tc = useTranslations("common");

  const [selectedTransaction, setSelectedTransaction] = useState<AdminTransaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (transaction: AdminTransaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("transactionList")}</CardTitle>
          <CardDescription>{t("transactionListDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("user")}</TableHead>
                <TableHead>{t("type")}</TableHead>
                <TableHead>{t("amount")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead>{t("date")}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
                      <div>
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1" />
                        <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("transactionList")}</CardTitle>
          <CardDescription>{t("transactionListDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <p>{t("noTransactionsFound")}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("user")}</TableHead>
                  <TableHead>{t("type")}</TableHead>
                  <TableHead>{t("amount")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>{t("date")}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => {
                  const displayName = formatUserName(transaction.user.fullName);
                  const initials = getInitials(transaction.user.fullName);

                  return (
                    <TableRow
                      key={transaction.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleViewDetails(transaction)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage
                              src={transaction.user.avatarUrl || getDefaultAvatar(transaction.user.fullName)}
                            />
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium text-sm">{displayName}</span>
                            <p className="text-xs text-muted-foreground">
                              {transaction.user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(transaction.type)}
                          <span className="text-sm capitalize">
                            {transaction.type.toLowerCase()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          €{(transaction.amount / 100).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusVariant(transaction.status)}
                          className={getStatusClassName(transaction.status)}
                        >
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(transaction);
                            }}>
                              {t("viewDetails")}
                            </DropdownMenuItem>
                            {transaction.sourceType === "ENROLLMENT" && (
                              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                View Program
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {pagination && onPageChange && (
            <AdminPagination
              total={pagination.total}
              page={page}
              limit={limit}
              totalPages={pagination.totalPages}
              onPageChange={onPageChange}
              isLoading={loading}
            />
          )}
        </CardContent>
      </Card>

      <TransactionDetailsModal
        transaction={selectedTransaction}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
