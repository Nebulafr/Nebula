
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserSelect, UserSelectValue } from "@/components/ui/user-select";

interface EventBasicDetailsProps {
  newEvent: any;
  setNewEvent: (event: any) => void;
}

export function EventBasicDetails({
  newEvent,
  setNewEvent,
}: EventBasicDetailsProps) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="event-title" className="text-right">
          Title
        </Label>
        <Input
          id="event-title"
          value={newEvent.title}
          onChange={(e) =>
            setNewEvent({ ...newEvent, title: e.target.value })
          }
          className="col-span-3"
          placeholder="Enter event title"
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="event-description" className="text-right">
          Description
        </Label>
        <Textarea
          id="event-description"
          value={newEvent.description}
          onChange={(e) =>
            setNewEvent({ ...newEvent, description: e.target.value })
          }
          className="col-span-3"
          placeholder="Enter event description"
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="event-date" className="text-right">
          Date & Time
        </Label>
        <Input
          id="event-date"
          type="datetime-local"
          value={newEvent.date}
          onChange={(e) =>
            setNewEvent({ ...newEvent, date: e.target.value })
          }
          className="col-span-3"
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="organizer" className="text-right">
          Organizer
        </Label>
        <div className="col-span-3">
          <UserSelect
            value={newEvent.organizerId}
            onChange={(value: UserSelectValue | null) =>
              setNewEvent({ ...newEvent, organizerId: value?.id || "" })
            }
            placeholder="Select event organizer"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="event-location" className="text-right">
          Location
        </Label>
        <Input
          id="event-location"
          value={newEvent.location}
          onChange={(e) =>
            setNewEvent({ ...newEvent, location: e.target.value })
          }
          className="col-span-3"
          placeholder="Enter event location"
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="max-attendees" className="text-right">
          Max Attendees
        </Label>
        <Input
          id="max-attendees"
          type="number"
          value={newEvent.maxAttendees}
          onChange={(e) =>
            setNewEvent({ ...newEvent, maxAttendees: e.target.value })
          }
          className="col-span-3"
          placeholder="Enter maximum attendees"
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="what-to-bring" className="text-right">
          What to Bring
        </Label>
        <Input
          id="what-to-bring"
          value={newEvent.whatToBring}
          onChange={(e) =>
            setNewEvent({ ...newEvent, whatToBring: e.target.value })
          }
          className="col-span-3"
          placeholder="What should attendees bring?"
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="additional-info" className="text-right">
          Additional Info
        </Label>
        <Textarea
          id="additional-info"
          value={newEvent.additionalInfo}
          onChange={(e) =>
            setNewEvent({ ...newEvent, additionalInfo: e.target.value })
          }
          className="col-span-3"
          placeholder="Any additional information"
        />
      </div>

    </div>
  );
}