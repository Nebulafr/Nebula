"use client";

import { Card, CardContent } from "@/components/ui/card";
import { EventType } from "@/types/event";

interface EventTypeSelectionProps {
  selectedEventType: string;
  onEventTypeSelect: (eventType: EventType) => void;
}

export function EventTypeSelection({
  selectedEventType,
  onEventTypeSelect,
}: EventTypeSelectionProps) {
  return (
    <div className="grid gap-6 py-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Choose Event Type</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Select the type of event you want to create
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* WEBINAR Option */}
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedEventType === EventType.WEBINAR ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => onEventTypeSelect(EventType.WEBINAR)}
        >
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-3">📹</div>
            <h4 className="font-semibold">Webinar</h4>
            <p className="text-sm text-muted-foreground mt-2">
              Online educational sessions with Google Meet integration
            </p>
          </CardContent>
        </Card>

        {/* SOCIAL Option */}
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedEventType === EventType.SOCIAL ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => onEventTypeSelect(EventType.SOCIAL)}
        >
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-3">🎉</div>
            <h4 className="font-semibold">Social Event</h4>
            <p className="text-sm text-muted-foreground mt-2">
              In-person gatherings and networking events
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
