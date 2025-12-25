"use client";

import React, { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { UserFilters } from "./components/user-filters";
import { UsersTable } from "./components/users-table";
import { AddUserDialog } from "./components/add-user-dialog";
import { useAdminUsers, useCreateUser } from "@/hooks";
import { toast } from "react-toastify";


export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { 
    data: users = [], 
    isLoading: loading,
    refetch: fetchUsers
  } = useAdminUsers({
    search: debouncedSearch || undefined,
    role: activeTab === "all" ? undefined : activeTab,
  });

  const createUserMutation = useCreateUser();

  // Debounce search term
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Transform users to match the table interface
  const transformedUsers = users.map((user: any) => ({
    name: user.fullName || user.email,
    email: user.email,
    avatar: user.avatarUrl,
    role: user.role,
    status:
      user.status === "ACTIVE"
        ? "Active"
        : user.status === "SUSPENDED"
        ? "Suspended"
        : "Inactive",
    joined: user.createdAt
      ? new Date(user.createdAt).toLocaleDateString()
      : "Unknown",
  }));

  const handleAddUser = async (userData: {
    name: string;
    email: string;
    role: string;
    password: string;
  }) => {
    try {
      await createUserMutation.mutateAsync(userData);
      toast.success("User created successfully!");
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(error.message || "An error occurred while creating the user.");
    }
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
          <AddUserDialog onAddUser={handleAddUser} loading={createUserMutation.isPending} />
        </div>

        <TabsContent value={activeTab} className="mt-6">
          <UsersTable
            users={transformedUsers}
            loading={loading}
            onUserAction={handleUserAction}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
