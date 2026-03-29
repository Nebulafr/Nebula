import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface PriceFiltersProps {
  activePriceFilter: string;
  onPriceFilterChange: (filter: string) => void;
  loading?: boolean;
}

export function PriceFilters({
  activePriceFilter,
  onPriceFilterChange,
  loading,
}: PriceFiltersProps) {
  const t = useTranslations("events.filters");
  const priceFilters = ["all", "free", "premium"];

  return (
    <div className="mx-auto mt-8 flex max-w-lg justify-center gap-2">
      {priceFilters.map((filter) => (
        <Button
          key={filter}
          variant="outline"
          className={cn(
            "rounded-full",
            activePriceFilter.toLowerCase() === filter && "bg-muted font-bold"
          )}
          onClick={() => onPriceFilterChange(filter.charAt(0).toUpperCase() + filter.slice(1))}
          disabled={loading && activePriceFilter.toLowerCase() === filter}
        >
          {loading && activePriceFilter.toLowerCase() === filter ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t(filter)}
            </div>
          ) : (
            t(filter)
          )}
        </Button>
      ))}
    </div>
  );
}
