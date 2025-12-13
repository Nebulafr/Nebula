"use client";

import React, { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { UserFilters } from "./components/user-filters";
import { UsersTable } from "./components/users-table";
import { AddUserDialog } from "./components/add-user-dialog";
import { useAdminUsers } from "@/hooks/use-admin-users";
import { toast } from "react-toastify";

// Simple debounce function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { users, loading, fetchUsers } = useAdminUsers();

  // Debounced search function
  const debouncedFetch = React.useCallback(
    debounce((search: string, role: string) => {
      fetchUsers({
        search: search || undefined,
        role: role === "all" ? undefined : role,
      });
    }, 300),
    [fetchUsers]
  );

  // Initial fetch on mount
  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Effect to trigger API call when search or tab changes
  React.useEffect(() => {
    if (searchTerm || activeTab !== "all") {
      debouncedFetch(searchTerm, activeTab);
    } else {
      fetchUsers();
    }
  }, [searchTerm, activeTab, debouncedFetch, fetchUsers]);

  // Transform users to match the table interface
  const transformedUsers = users.map((user) => ({
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
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          fullName: userData.name,
          role: userData.role.toUpperCase(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        fetchUsers();
      } else {
        console.error("Failed to create user:", result.message);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("An error occurred while creating the user.");
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
          <AddUserDialog onAddUser={handleAddUser} loading={loading} />
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
