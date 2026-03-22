 
"use client";

import React, { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { UserFilters } from "./components/user-filters";
import { UsersTable } from "./components/users-table";
import { AddUserDialog } from "./components/add-user-dialog";
import { useAdminUsers, useCreateUser, useDeleteUser } from "@/hooks";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { ConfirmModal } from "@/components/shared/confirm-modal";

export default function UserManagementPage() {
  const t = useTranslations("dashboard.admin");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
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
  const deleteUserMutation = useDeleteUser();

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
    id: user.id,
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

  const handleUserAction = async (user: any, action: string) => {
    if (action === "delete") {
      setUserToDelete(user);
      setIsDeleteModalOpen(true);
    } else {
      console.log(`User ${action}:`, user);
      // TODO: Implement other user action logic
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteUserMutation.mutateAsync(userToDelete.id);
      toast.success(t("userDeletedSuccessfully"));
    } catch (error) {
      // Error handled by mutation hook
    } finally {
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
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

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t("deleteUser")}
        description={t("confirmDeleteUser", { name: userToDelete?.name })}
        confirmText={t("delete")}
        cancelText={t("cancel")}
        variant="destructive"
        isLoading={deleteUserMutation.isPending}
      />
    </div>
  );
}
