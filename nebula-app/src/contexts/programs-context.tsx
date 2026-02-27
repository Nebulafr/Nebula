 
"use client";

import { useAuth } from "@/hooks/use-auth";
import { makeRequest } from "@/lib/utils";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { handleAndToastError } from "@/lib/error-handler";

interface ProgramsParams {
  coachId?: string;
  category?: string;
  limit?: number;
}

interface ProgramsContextType {
  programs: any[];
  loading: boolean;
  error: string | null;
  refetch: (params?: ProgramsParams) => Promise<void>;
  fetchPrograms: (params?: ProgramsParams) => Promise<any[]>;
}

const ProgramsContext = createContext<ProgramsContextType | undefined>(
  undefined
);

export function ProgramsProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrograms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await makeRequest(`/programs/recommended`, "GET", {
        requireAuth: true,
      });
      if (response.success && response.data?.programs) {
        const programs = response.data.programs;
        setPrograms(programs);
        return programs;
      } else {
        setError(response.error || "Failed to fetch programs");
        setPrograms([]);
        return [];
      }
    } catch (err) {
      handleAndToastError(err, "An error occurred while fetching programs");
      setPrograms([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchPrograms();
  }, [fetchPrograms]);

  useEffect(() => {
    if (!profile) return;
    fetchPrograms();
  }, [profile, fetchPrograms]);

  return (
    <ProgramsContext.Provider
      value={{ programs, loading, error, refetch, fetchPrograms }}
    >
      {children}
    </ProgramsContext.Provider>
  );
}

export function useProgramsContext() {
  const context = useContext(ProgramsContext);
  if (!context) {
    throw new Error(
      "useProgramsContext must be used within a ProgramsProvider"
    );
  }
  return context;
}
