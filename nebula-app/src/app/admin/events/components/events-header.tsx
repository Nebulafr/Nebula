"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventsHeaderProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  activeTab: string;
  setActiveTab: (value: string) => void;
  loading: boolean;
  onCreateEvent: () => void;
}

const eventTypes = ["all", "webinar", "social"];

export function EventsHeader({
  searchTerm,
  setSearchTerm,
  activeTab,
  setActiveTab,
  loading,
  onCreateEvent,
}: EventsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search events or organizers..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex-shrink-0 flex items-center gap-2">
        {eventTypes.map((type) => (
          <Button
            key={type}
            variant="outline"
            className={cn(
              "rounded-full capitalize",
              activeTab === type && "bg-muted font-bold"
            )}
            onClick={() => setActiveTab(type)}
            disabled={loading && activeTab === type}
          >
            {loading && activeTab === type ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {type === "all" ? "All Events" : type}
              </div>
            ) : type === "all" ? (
              "All Events"
            ) : (
              type
            )}
          </Button>
        ))}
        <Button onClick={onCreateEvent}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>
    </div>
  );
}
