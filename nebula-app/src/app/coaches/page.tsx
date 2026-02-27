/* eslint-disable */
"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Search,
  X,
  ChevronDown,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import React from "react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCategories, useCoaches } from "@/hooks";
import { useTranslations } from "next-intl";
import { CoachCard } from "@/components/cards/coach-card";
import { Pagination } from "@/components/ui/pagination";
import { ApiCoach } from "@/types/coach";


function SearchableFilter({
  label,
  placeholder,
  value,
  onValueChange,
  options,
}: {
  label: string;
  placeholder: string;
  value: string;
  onValueChange: (val: string) => void;
  options: string[];
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase()),
  );

  const displayValue = value === "all" ? placeholder : value;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="flex flex-col gap-1.5 p-3 rounded-xl border bg-card hover:border-primary transition-colors cursor-pointer group h-full">
          <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1 group-hover:text-primary transition-colors cursor-pointer">
            {label}
          </Label>
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                "text-sm font-semibold truncate",
                value === "all" && "text-muted-foreground font-normal",
              )}
            >
              {displayValue}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0" align="start">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Type to search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <ScrollArea className="h-[200px]">
          <div className="p-1">
            <div
              className={cn(
                "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                value === "all" && "bg-accent text-accent-foreground",
              )}
              onClick={() => {
                onValueChange("all");
                setOpen(false);
                setSearch("");
              }}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  value === "all" ? "opacity-100" : "opacity-0",
                )}
              />
              {placeholder}
            </div>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                    value === opt && "bg-accent text-accent-foreground",
                  )}
                  onClick={() => {
                    onValueChange(opt);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === opt ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {opt}
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No results found.
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

const priceRanges = [
  { label: "Any price", value: "all" },
  { label: "€0 – €50", value: "0-50" },
  { label: "€50 – €100", value: "50-100" },
  { label: "€100 – €200", value: "100-200" },
  { label: "€200+", value: "200-9999" },
];

function CoachesPageContent() {
  const t = useTranslations("coaches");
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [selectedSchool, setSelectedSchool] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: categoriesResponse } = useCategories();

  // Parse price range
  const { minPrice, maxPrice } = React.useMemo(() => {
    if (selectedPriceRange === "all") return { minPrice: undefined, maxPrice: undefined };
    const [min, max] = selectedPriceRange.split("-").map(Number);
    return { minPrice: min, maxPrice: max };
  }, [selectedPriceRange]);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSpecialty, selectedPriceRange, selectedCompany, selectedSchool]);

  // Fetch coaches with filters
  const { data: coachesResponse, isLoading: loading } = useCoaches({
    category: selectedSpecialty === "all" ? undefined : selectedSpecialty,
    search: searchTerm || undefined,
    minPrice,
    maxPrice,
    company: selectedCompany === "all" ? undefined : selectedCompany,
    school: selectedSchool === "all" ? undefined : selectedSchool,
    limit: 24,
    page: currentPage,
  });
  const categoriesData = categoriesResponse?.data?.categories || [];
  const filteredCoaches: ApiCoach[] = coachesResponse?.coaches || [];
  const pagination = coachesResponse?.pagination;

  const specialties = React.useMemo(() => {
    return categoriesData.map((c: { name: string }) => c.name).sort();
  }, [categoriesData]);

  const companies: string[] = [];
  const schools: string[] = [];

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSpecialty("all");
    setSelectedPriceRange("all");
    setSelectedCompany("all");
    setSelectedSchool("all");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm !== "" ||
    selectedSpecialty !== "all" ||
    selectedPriceRange !== "all" ||
    selectedCompany !== "all" ||
    selectedSchool !== "all";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="container py-12">
          <div className="text-center mb-12">
            <h1 className="font-headline text-5xl font-bold tracking-tighter text-primary md:text-6xl">
              {t("title")}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-foreground/70">
              {t("description")}
            </p>
          </div>

          {/* Unified Filter Bar */}
          <div className="mx-auto max-w-6xl space-y-8">
            {/* Row 1: Primary Search Bar (Centered and smaller) */}
            <div className="mx-auto max-w-2xl">
              <div className="relative flex items-center">
                <Search className="absolute left-5 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  className="h-14 w-full rounded-full border border-border bg-card pl-12 pr-6 focus:border-primary focus:outline-none focus:ring-0 text-base shadow-sm transition-all placeholder:text-muted-foreground/60"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Row 2: Detailed Select Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Specialty Filter */}
              <SearchableFilter
                label="Speciality"
                placeholder="All specialties"
                value={selectedSpecialty}
                onValueChange={setSelectedSpecialty}
                options={specialties}
              />

              {/* Price Filter */}
              <div className="flex flex-col gap-1.5 p-3 rounded-xl border bg-card hover:border-primary transition-colors cursor-pointer">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">
                  Price per hour
                </Label>
                <Select
                  value={selectedPriceRange}
                  onValueChange={setSelectedPriceRange}
                >
                  <SelectTrigger className="border-0 p-0 h-auto focus:ring-0 shadow-none text-sm font-semibold">
                    <SelectValue placeholder="Any price" />
                  </SelectTrigger>
                  <SelectContent>
                    {priceRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Company Filter */}
              <SearchableFilter
                label="Company background"
                placeholder="Any company"
                value={selectedCompany}
                onValueChange={setSelectedCompany}
                options={companies}
              />

              {/* School Filter */}
              <SearchableFilter
                label="Academic background"
                placeholder="Any school"
                value={selectedSchool}
                onValueChange={setSelectedSchool}
                options={schools}
              />
            </div>

            <div className="flex justify-end">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-primary h-8"
                >
                  <X className="mr-2 h-4 w-4" /> Clear all filters
                </Button>
              )}
            </div>
          </div>
        </section>

        <section className="container pb-20">
          <div className="mb-8 flex items-center justify-between border-b pb-4">
            <h2 className="font-headline text-2xl font-bold">
              {filteredCoaches.length} coach
              {filteredCoaches.length !== 1 ? "es" : ""} available
            </h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
              <p className="text-lg font-medium">Finding the best coaches for you...</p>
            </div>
          ) : filteredCoaches.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCoaches.map((coach) => (
                <Link key={coach.id} href={`/coaches/${coach.id}`}>
                  <CoachCard coach={coach} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-muted-foreground border rounded-2xl border-dashed bg-muted/20">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">
                No coaches found matching your criteria.
              </p>
              <p className="text-sm mb-6">
                Try adjusting your filters or search terms.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          )}

          {/* Pagination UI */}
          <Pagination
            currentPage={currentPage}
            totalPages={pagination?.totalPages || 0}
            onPageChange={setCurrentPage}
          />
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default function CoachesPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <CoachesPageContent />
    </React.Suspense>
  );
}
