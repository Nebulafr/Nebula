import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface PriceFiltersProps {
  activePriceFilter: string;
  onPriceFilterChange: (filter: string) => void;
  loading?: boolean;
}

const priceFilters = ["All", "Free", "Premium"];

export function PriceFilters({
  activePriceFilter,
  onPriceFilterChange,
  loading,
}: PriceFiltersProps) {
  return (
    <div className="mx-auto mt-8 flex max-w-lg justify-center gap-2">
      {priceFilters.map((filter) => (
        <Button
          key={filter}
          variant="outline"
          className={cn(
            "rounded-full",
            activePriceFilter === filter && "bg-muted font-bold"
          )}
          onClick={() => onPriceFilterChange(filter)}
          disabled={loading && activePriceFilter === filter}
        >
          {loading && activePriceFilter === filter ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {filter}
            </div>
          ) : (
            filter
          )}
        </Button>
      ))}
    </div>
  );
}
