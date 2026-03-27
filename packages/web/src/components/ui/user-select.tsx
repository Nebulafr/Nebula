
"use client";

import React from "react";
import ReactSelect, { SingleValue, Props as SelectProps } from "react-select";
import { useAdminUsers, AdminUser } from "@/hooks";
import { UserRole } from "@/enums";
import { CoCoach } from "@/app/coach-dashboard/programs/propose/context/propose-program-context";

// Type assertion for react-select to fix TypeScript compatibility
const Select = ReactSelect as React.ComponentType<SelectProps<Record<string, unknown>, false>>;

export interface UserSelectOption {
  value: UserSelectValue;
  label: string;
  avatar?: string;
}

export interface UserSelectValue {
  id: string;
  coachId?: string;
  name: string;
  avatar?: string;
}

interface UserSelectProps {
  value?: string | UserSelectValue;
  onChange: (value: UserSelectValue | null) => void;
  placeholder?: string;
  className?: string;
  role?: UserRole;
}

export function UserSelect({
  value,
  onChange,
  placeholder = "Select a user...",
  role,
}: UserSelectProps) {
  const { data: usersResponse, isLoading: loading } = useAdminUsers({ limit: 100, role });

  const options = React.useMemo(() => {
    const users = (usersResponse?.users as AdminUser[]) || [];
    return users
      .map((user: AdminUser) => ({
        value: {
          id: user.id,
          coachId: user.coach?.id,
          name: user.fullName || user.email,
          avatar: user.avatarUrl,
        },
        label: `${user.fullName || user.email} (${user.role.toLowerCase()})`,
        avatar: user.avatarUrl,
      }));
  }, [usersResponse]);

  const selectedOption = value
    ? options.find(
      (option: UserSelectOption) =>
        option.value.id === (typeof value === "string" ? value : value.id)
    ) || null
    : null;
  const handleChange = (option: any) => {
    onChange(option ? option.value : null);
  };

  return (
    <Select
      value={selectedOption}
      onChange={handleChange}
      options={options}
      placeholder={placeholder}
      isDisabled={loading}
      isLoading={loading}
      isClearable
      isSearchable
      name="user"
      className="basic-single"
      classNamePrefix="select"
    />
  );
}
