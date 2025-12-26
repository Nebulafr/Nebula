import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PriceFiltersProps {
  activePriceFilter: string;
  onPriceFilterChange: (filter: string) => void;
}

const priceFilters = ["All", "Free", "Premium"];

export function PriceFilters({
  activePriceFilter,
  onPriceFilterChange,
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
        >
          {filter}
        </Button>
      ))}
    </div>
  );
}