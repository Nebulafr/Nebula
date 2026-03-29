"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface CoachOnboardingData {
  role: string;
  company: string;
  linkedin: string;
  specialties: string[];
  motivation: string;
  style: string;
  country: string;
  countryIso: string;
  hourlyRate: string;
  availability: string;
}

interface CoachOnboardingContextType {
  data: CoachOnboardingData;
  updateData: (newData: Partial<CoachOnboardingData>) => void;
  resetData: () => void;
}

const STORAGE_KEY = "nebula_coach_onboarding_data";

const defaultData: CoachOnboardingData = {
  role: "",
  company: "",
  linkedin: "",
  specialties: [],
  motivation: "",
  style: "",
  country: "",
  countryIso: "",
  hourlyRate: "",
  availability: "",
};

const CoachOnboardingContext = createContext<CoachOnboardingContextType | undefined>(
  undefined
);

export function CoachOnboardingProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<CoachOnboardingData>(() => {
    if (typeof window !== "undefined") {
      const savedData = sessionStorage.getItem(STORAGE_KEY);
      if (savedData) {
        try {
          return JSON.parse(savedData);
        } catch (e) {
          console.error("Failed to parse coach onboarding data", e);
        }
      }
    }
    return defaultData;
  });

  // Save to sessionStorage on changes
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const updateData = (newData: Partial<CoachOnboardingData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  };

  const resetData = () => {
    setData(defaultData);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return (
    <CoachOnboardingContext.Provider value={{ data, updateData, resetData }}>
      {children}
    </CoachOnboardingContext.Provider>
  );
}

export function useCoachOnboarding() {
  const context = useContext(CoachOnboardingContext);
  if (context === undefined) {
    throw new Error("useCoachOnboarding must be used within a CoachOnboardingProvider");
  }
  return context;
}
