"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getCategories } from "@/actions/categories";
import { Category } from "@/generated/prisma";

interface CategoryContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined
);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getCategories();

      if (response.success && response.data?.categories) {
        setCategories(response.data.categories);
      } else {
        setError(response.error || "Failed to fetch categories");
        setCategories([]);
      }
    } catch (err: any) {
      console.error("Error fetching categories:", err);
      setError(err.message || "An unexpected error occurred");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const value: CategoryContextType = {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error("useCategories must be used within a CategoryProvider");
  }
  return context;
}
