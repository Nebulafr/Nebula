"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { TransactionFilters } from "./components/transaction-filters";
import { TransactionsTable } from "./components/transactions-table";
import { useAdminTransactions } from "@/hooks";
import { useTranslations } from "next-intl";

export default function TransactionsPage() {
  const t = useTranslations("dashboard.admin");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    data: transactionsResponse,
    isLoading: loading,
  } = useAdminTransactions({
    search: debouncedSearch || undefined,
    type: activeTab === "all" ? undefined : activeTab,
    page,
    limit,
  });

  const transactions = transactionsResponse?.transactions || [];
  const pagination = transactionsResponse?.pagination;

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    setPage(1);
  };

  // Debounce search term and reset page
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("transactionManagement")}</h2>
          <p className="text-muted-foreground">
            {t("transactionListDescription")}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TransactionFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          loading={loading}
        />

        <TabsContent value={activeTab} className="mt-6">
          <TransactionsTable
            transactions={transactions}
            loading={loading}
            pagination={pagination}
            onPageChange={setPage}
            page={page}
            limit={limit}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
