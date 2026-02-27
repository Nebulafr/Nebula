 
"use client";

import React, { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { UserFilters } from "./components/user-filters";
import { UsersTable } from "./components/users-table";
import { AddUserDialog } from "./components/add-user-dialog";
import { useAdminUsers, useCreateUser } from "@/hooks";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

export default function UserManagementPage() {
  const t = useTranslations("dashboard.admin");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    data: usersResponse,
    isLoading: loading,
    refetch: fetchUsers,
  } = useAdminUsers({
    search: debouncedSearch || undefined,
    role: activeTab === "all" ? undefined : activeTab,
    page,
    limit,
  });

  const users = usersResponse?.users || [];
  const pagination = usersResponse?.pagination;

  const createUserMutation = useCreateUser();

  // Debounce search term and reset page
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when tab changes
  React.useEffect(() => {
    setPage(1);
  }, [activeTab]);

  // Transform users to match the table interface
  const transformedUsers = users.map((user: any) => ({
    name: user.fullName || user.email,
    email: user.email,
    avatar: user.avatarUrl,
    role: user.role,
    status: user.status,
    joined: user.createdAt
      ? new Date(user.createdAt).toLocaleDateString()
      : t("statusUnknown"),
  }));

  const handleAddUser = async (userData: {
    name: string;
    email: string;
    role: string;
    password: string;
  }) => {
    return await createUserMutation.mutateAsync(userData);
  };
  const handleUserAction = (user: any, action: string) => {
    console.log(`User ${action}:`, user);
    // TODO: Implement user action logic
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <UserFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          loading={loading}
        />
        <div className="flex justify-end mb-4">
          <AddUserDialog
            onAddUser={handleAddUser}
            loading={createUserMutation.isPending}
          />
        </div>

        <TabsContent value={activeTab} className="mt-6">
          <UsersTable
            users={transformedUsers}
            loading={loading}
            onUserAction={handleUserAction}
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
