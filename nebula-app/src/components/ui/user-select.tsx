"use client";

import React from "react";
import ReactSelect, { SingleValue, Props as SelectProps } from "react-select";
import { useAdminUsers } from "@/hooks";
import { UserRole } from "@/enums";

// Type assertion for react-select to fix TypeScript compatibility
const Select = ReactSelect as React.ComponentType<SelectProps<any, false>>;

export interface UserSelectOption {
  value: string;
  label: string;
}

interface UserSelectProps {
  value?: string;
  onChange: (userId: string | null) => void;
  placeholder?: string;
  className?: string;
}

export function UserSelect({
  value,
  onChange,
  placeholder = "Select a user...",
}: UserSelectProps) {
  const { data: users = [], isLoading: loading } = useAdminUsers();

  const options = React.useMemo(() => {
    return users
      .filter((user: any) => user.role !== UserRole.ADMIN)
      .map((user: any) => ({
        value: user.id,
        label: `${user.fullName || user.email} (${user.role.toLowerCase()})`,
      }));
  }, [users]);

  const selectedOption = value
    ? options.find((option: any) => option.value === value) || null
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
