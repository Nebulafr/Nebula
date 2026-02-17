"use client";

import React from "react";
import ReactSelect, { SingleValue, Props as SelectProps } from "react-select";
import { useAdminUsers, useAuth } from "@/hooks";
import { UserRole } from "@/enums";
import { CoCoach } from "@/app/coach-dashboard/programs/propose/context/propose-program-context";

// Type assertion for react-select to fix TypeScript compatibility
const Select = ReactSelect as React.ComponentType<SelectProps<any, false>>;

export interface UserSelectOption {
  value: string;
  label: string;

}

interface UserSelectProps {
  value?: string | CoCoach;
  onChange: (userId: string | CoCoach | null) => void;
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
  const { profile } = useAuth();
  const users = usersResponse?.users || [];

  const options = React.useMemo(() => {
    return users
      .map((user: any) => ({
        value: {
          id: user.id,
          coachId: user.coach?.id,
          name: user.fullName || user.email,
          avatar: user.avatarUrl,
        },
        label: `${user.fullName || user.email} (${user.role.toLowerCase()})`,
        avatar: user.avatarUrl,
      }));
  }, [users]);

  const selectedOption = value
    ? options.find(
        (option: any) =>
          option.value.id === (typeof value === "string" ? value : value.id)
      ) || null
    : null;

  const handleChange = (option: SingleValue<UserSelectOption>) => {
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
