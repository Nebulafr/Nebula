"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { apiGet } from "@/lib/utils";

export interface UserOption {
  id: string;
  fullName: string;
  email: string;
  role: "COACH" | "STUDENT" | "ADMIN";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserContextType {
  users: UserOption[];
  loading: boolean;
  error: string | null;
  fetchUsers: (params?: {
    search?: string;
    role?: string;
    status?: string;
  }) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async (params?: {
    search?: string;
    role?: string;
    status?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append("search", params.search);
      if (params?.role) queryParams.append("role", params.role);
      if (params?.status) queryParams.append("status", params.status);

      const url = `/admin/users${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await apiGet(url);
      if (response.success) {
        setUsers(response.data.users || []);
      } else {
        setError(response.message || "Failed to fetch users");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const value = {
    users,
    loading,
    error,
    fetchUsers,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUsers() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUsers must be used within a UserProvider");
  }
  return context;
}
