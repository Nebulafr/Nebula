"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface StudentOnboardingData {
  interestedCategoryId: string;
  skillLevel?: string;
  country: string;
  countryIso: string;
  availability?: string;
}

interface StudentOnboardingContextType {
  data: StudentOnboardingData;
  updateData: (newData: Partial<StudentOnboardingData>) => void;
  resetData: () => void;
}

const STORAGE_KEY = "nebula_student_onboarding_data";

const defaultData: StudentOnboardingData = {
  interestedCategoryId: "",
  country: "",
  countryIso: "",
};

const StudentOnboardingContext = createContext<StudentOnboardingContextType | undefined>(
  undefined
);

export function StudentOnboardingProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<StudentOnboardingData>(() => {
    if (typeof window !== "undefined") {
      const savedData = sessionStorage.getItem(STORAGE_KEY);
      if (savedData) {
        try {
          return JSON.parse(savedData);
        } catch (e) {
          console.error("Failed to parse student onboarding data", e);
        }
      }
    }
    return defaultData;
  });

  // Save to sessionStorage on changes
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const updateData = (newData: Partial<StudentOnboardingData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  };

  const resetData = () => {
    setData(defaultData);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return (
    <StudentOnboardingContext.Provider value={{ data, updateData, resetData }}>
      {children}
    </StudentOnboardingContext.Provider>
  );
}

export function useStudentOnboarding() {
  const context = useContext(StudentOnboardingContext);
  if (context === undefined) {
    throw new Error("useStudentOnboarding must be used within a StudentOnboardingProvider");
  }
  return context;
}
