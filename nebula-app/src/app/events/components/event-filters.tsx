 
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Video, PartyPopper, Users, Star, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface EventFiltersProps {
  activeTypeFilter: string | null;
  onTypeFilterClick: (filterName: string) => void;
  loading: boolean;
}

export function EventFilters({
  activeTypeFilter,
  onTypeFilterClick,
  loading,
}: EventFiltersProps) {
  const t = useTranslations("events.filters");
  const typeFilters = [
    {
      id: "Webinar",
      key: "webinar",
      icon: <Video className="mr-2 h-4 w-4" />,
    },
    {
      id: "Social",
      key: "social",
      icon: <PartyPopper className="mr-2 h-4 w-4" />,
    },
  ];

  return (
    <div className="mx-auto mt-4 flex max-w-3xl justify-center gap-4">
      <TooltipProvider>
        {typeFilters.map((filter) => (
          <Tooltip key={filter.id}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className={cn(activeTypeFilter === filter.id && "bg-muted")}
                onClick={() => onTypeFilterClick(filter.id)}
                disabled={loading && activeTypeFilter === filter.id}
              >
                {loading && activeTypeFilter === filter.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t(filter.key)}
                  </>
                ) : (
                  <>
                    {filter.icon}
                    {t(filter.key)}
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t(`${filter.key}Tooltip`)}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
}
