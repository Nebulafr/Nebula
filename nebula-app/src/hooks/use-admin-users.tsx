"use client";

import { useState, useCallback } from "react";
import { makeRequest } from "@/lib/utils";

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: "COACH" | "STUDENT" | "ADMIN";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface UseAdminUsersParams {
  search?: string;
  role?: string;
  status?: string;
}

interface UseAdminUsersReturn {
  users: AdminUser[];
  loading: boolean;
  error: string | null;
  fetchUsers: (params?: UseAdminUsersParams) => Promise<void>;
  refetch: () => void;
}

export function useAdminUsers(): UseAdminUsersReturn {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastParams, setLastParams] = useState<UseAdminUsersParams>({});

  const fetchUsers = useCallback(async (params: UseAdminUsersParams = {}) => {
    setLoading(true);
    setError(null);
    setLastParams(params);

    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append("search", params.search);
      if (params.role) queryParams.append("role", params.role);
      if (params.status) queryParams.append("status", params.status);

      const url = `/admin/users${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await makeRequest(url, "GET");

      if (response.success) {
        setUsers(response.data.users || []);
      } else {
        setError(response.message || "Failed to fetch users");
        setUsers([]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchUsers(lastParams);
  }, [fetchUsers, lastParams]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    refetch,
  };
}
