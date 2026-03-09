"use client";

import React from "react";
import { getCountries } from "@/actions/location";

interface CountrySelectProps {
  value: string;
  onChange: (val: string) => void;
  onIsoChange?: (iso: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function CountrySelect({
  value,
  onChange,
  onIsoChange,
  disabled,
  placeholder = "Select your country…",
  className,
}: CountrySelectProps) {
  const [countries, setCountries] = React.useState<{ name: string; iso2: string }[]>([]);

  React.useEffect(() => {
    getCountries().then((res) => {
      if (res.success && res.data) setCountries(res.data);
    });
  }, []);

  return (
    <select
      value={value}
      onChange={(e) => {
        const selectedName = e.target.value;
        onChange(selectedName);
        if (onIsoChange) {
          const country = countries.find((c) => c.name === selectedName);
          if (country) onIsoChange(country.iso2);
        }
      }}
      disabled={disabled}
      className={
        className ??
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      }
    >
      <option value="">{placeholder}</option>
      {countries.map((c) => (
        <option key={c.iso2} value={c.name}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
