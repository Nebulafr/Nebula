"use client";

import React from "react";
import Select, { SingleValue, StylesConfig } from "react-select";
import { getCountries } from "@/actions/location";

interface CountryOption {
  value: string;
  label: string;
  iso2: string;
}

interface CountrySelectProps {
  value: string;
  onChange: (val: string) => void;
  onIsoChange?: (iso: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const customStyles: StylesConfig<CountryOption, false> = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "hsl(var(--background))",
    borderColor: state.isFocused ? "hsl(var(--primary))" : "hsl(var(--input))",
    borderRadius: "1rem", // 2xl
    height: "3.5rem", // h-14
    paddingLeft: "0.5rem",
    boxShadow: state.isFocused ? "0 0 0 4px hsla(var(--primary), 0.1)" : "none",
    "&:hover": {
      borderColor: "hsl(var(--primary) / 0.5)",
    },
    transition: "all 0.2s ease",
    fontSize: "1.125rem", // text-lg
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "hsl(var(--popover))",
    borderRadius: "1rem",
    padding: "0.5rem",
    zIndex: 50,
    border: "1px solid hsl(var(--border))",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "hsl(var(--primary))"
      : state.isFocused
        ? "hsl(var(--accent))"
        : "transparent",
    color: state.isSelected
      ? "hsl(var(--primary-foreground))"
      : "hsl(var(--foreground))",
    borderRadius: "0.5rem",
    margin: "2px 0",
    cursor: "pointer",
    "&:active": {
      backgroundColor: "hsl(var(--primary) / 0.8)",
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: "hsl(var(--foreground))",
  }),
  input: (base) => ({
    ...base,
    color: "hsl(var(--foreground))",
  }),
  placeholder: (base) => ({
    ...base,
    color: "hsl(var(--muted-foreground))",
  }),
};

export function CountrySelect({
  value,
  onChange,
  onIsoChange,
  disabled,
  placeholder = "Select your country…",
  className,
}: CountrySelectProps) {
  const [countries, setCountries] = React.useState<CountryOption[]>([]);

  React.useEffect(() => {
    getCountries().then((res) => {
      if (res.success && res.data) {
        setCountries(
          res.data.map((c: { name: string; iso2: string }) => ({
            value: c.name,
            label: c.name,
            iso2: c.iso2,
          }))
        );
      }
    });
  }, []);

  const selectedOption = countries.find((c) => c.value === value) || null;

  const handleChange = (newValue: SingleValue<CountryOption>) => {
    if (newValue) {
      onChange(newValue.value);
      if (onIsoChange) onIsoChange(newValue.iso2);
    } else {
      onChange("");
      if (onIsoChange) onIsoChange("");
    }
  };

  return (
    <div className={className}>
      <Select
        instanceId="country-select"
        options={countries}
        value={selectedOption}
        onChange={handleChange}
        isDisabled={disabled}
        placeholder={placeholder}
        styles={customStyles}
        isClearable
        isLoading={countries.length === 0}
        classNamePrefix="react-select"
      />
    </div>
  );
}
