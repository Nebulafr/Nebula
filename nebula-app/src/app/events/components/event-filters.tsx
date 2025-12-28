import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Video, PartyPopper, Users, Star, Loader2 } from "lucide-react";

interface EventFiltersProps {
  activeTypeFilter: string | null;
  onTypeFilterClick: (filterName: string) => void;
  loading: boolean;
}

const typeFilters = [
  {
    name: "Webinar",
    icon: <Video className="mr-2 h-4 w-4" />,
    tooltip: "Show only webinars. Click again to clear.",
  },
  {
    name: "Social",
    icon: <PartyPopper className="mr-2 h-4 w-4" />,
    tooltip: "Show only social events. Click again to clear.",
  },
];

export function EventFilters({
  activeTypeFilter,
  onTypeFilterClick,
  loading,
}: EventFiltersProps) {
  return (
    <div className="mx-auto mt-4 flex max-w-3xl justify-center gap-4">
      <TooltipProvider>
        {typeFilters.map((filter) => (
          <Tooltip key={filter.name}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className={cn(activeTypeFilter === filter.name && "bg-muted")}
                onClick={() => onTypeFilterClick(filter.name)}
                disabled={loading && activeTypeFilter === filter.name}
              >
                {loading && activeTypeFilter === filter.name ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {filter.name}
                  </>
                ) : (
                  <>
                    {filter.icon}
                    {filter.name}
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{filter.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
}
