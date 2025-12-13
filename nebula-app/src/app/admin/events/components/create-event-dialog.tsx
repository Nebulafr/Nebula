"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserSelect } from "@/components/ui/user-select";
import { PlusCircle, Loader2 } from "lucide-react";
import { SessionCarousel } from "./session-carousel";

interface CreateEventDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  createStep: number;
  setCreateStep: (step: number) => void;
  newEvent: any;
  setNewEvent: (event: any) => void;
  actionLoading: Record<string, boolean>;
  onCreateEvent: () => void;
  currentSessionIndex: number;
  setCurrentSessionIndex: (index: number) => void;
  onAddSession: () => void;
  onUpdateSession: (index: number, field: string, value: string) => void;
  onRemoveSession: (index: number) => void;
  onNavigateToSession: (index: number) => void;
  onGoToPreviousSession: () => void;
  onGoToNextSession: () => void;
}

export function CreateEventDialog({
  isOpen,
  onOpenChange,
  createStep,
  setCreateStep,
  newEvent,
  setNewEvent,
  actionLoading,
  onCreateEvent,
  currentSessionIndex,
  setCurrentSessionIndex,
  onAddSession,
  onUpdateSession,
  onRemoveSession,
  onNavigateToSession,
  onGoToPreviousSession,
  onGoToNextSession,
}: CreateEventDialogProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) setCreateStep(1);
      }}
    >
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Create a new event for members to participate in.
          </DialogDescription>
        </DialogHeader>

        {/* STEP STATE */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Step {createStep} of {newEvent.eventType === "SOCIAL" ? 3 : 2}
          </p>
        </div>

        {/* STEP 1 — BASIC DETAILS */}
        {createStep === 1 && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-title" className="text-right">
                Title
              </Label>
              <Input
                id="event-title"
                className="col-span-3"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
                placeholder="Enter event title"
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="event-desc" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="event-desc"
                className="col-span-3"
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
                placeholder="Enter event description"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-type-new" className="text-right">
                Event Type
              </Label>
              <Select
                value={newEvent.eventType}
                onValueChange={(value) =>
                  setNewEvent({ ...newEvent, eventType: value as any })
                }
              >
                <SelectTrigger id="event-type-new" className="col-span-3">
                  <SelectValue placeholder="Select an event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEBINAR">Webinar</SelectItem>
                  <SelectItem value="SOCIAL">Social</SelectItem>
                  <SelectItem value="WORKSHOP">Workshop</SelectItem>
                  <SelectItem value="NETWORKING">Networking</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-organizer" className="text-right">
                Organizer
              </Label>
              <div className="col-span-3">
                <UserSelect
                  value={newEvent.organizerId}
                  onChange={(userId) =>
                    setNewEvent({ ...newEvent, organizerId: userId || "" })
                  }
                  placeholder="Select an organizer..."
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-date" className="text-right">
                Date
              </Label>
              <Input
                id="event-date"
                type="date"
                className="col-span-3"
                value={newEvent.date}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, date: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-location" className="text-right">
                Location
              </Label>
              <Input
                id="event-location"
                className="col-span-3"
                value={newEvent.location}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, location: e.target.value })
                }
                placeholder="Enter event location"
              />
            </div>
          </div>
        )}

        {/* STEP 2 — EVENT SESSIONS (Only for SOCIAL events) */}
        {createStep === 2 && newEvent.eventType === "SOCIAL" && (
          <SessionCarousel
            sessions={newEvent.sessions}
            currentSessionIndex={currentSessionIndex}
            onAddSession={onAddSession}
            onUpdateSession={onUpdateSession}
            onRemoveSession={onRemoveSession}
            onNavigateToSession={onNavigateToSession}
            onGoToPreviousSession={onGoToPreviousSession}
            onGoToNextSession={onGoToNextSession}
          />
        )}

        {/* STEP 2/3 — ADVANCED DETAILS */}
        {((createStep === 2 && newEvent.eventType !== "SOCIAL") ||
          (createStep === 3 && newEvent.eventType === "SOCIAL")) && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="event-images" className="text-right pt-2">
                Images
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="event-images"
                  value={newEvent.images.join("\n")}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      images: e.target.value
                        .split("\n")
                        .filter((url) => url.trim()),
                    })
                  }
                  placeholder="Enter image URLs (one per line)"
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-max-attendees" className="text-right">
                Max Attendees
              </Label>
              <Input
                id="event-max-attendees"
                type="number"
                className="col-span-3"
                value={newEvent.maxAttendees}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, maxAttendees: e.target.value })
                }
                placeholder="Maximum number of attendees"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Public Event</Label>
              <div className="col-span-3 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="event-public"
                  checked={newEvent.isPublic}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, isPublic: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <Label htmlFor="event-public" className="text-sm">
                  Make this event free and public
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="event-what-to-bring" className="text-right pt-2">
                What to Bring
              </Label>
              <Textarea
                id="event-what-to-bring"
                className="col-span-3"
                value={newEvent.whatToBring}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, whatToBring: e.target.value })
                }
                placeholder="What should attendees bring?"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="event-additional-info" className="text-right pt-2">
                Additional Info
              </Label>
              <Textarea
                id="event-additional-info"
                className="col-span-3"
                value={newEvent.additionalInfo}
                onChange={(e) =>
                  setNewEvent({
                    ...newEvent,
                    additionalInfo: e.target.value,
                  })
                }
                placeholder="Good to know information"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="event-tags" className="text-right pt-2">
                Tags
              </Label>
              <div className="col-span-3">
                <Input
                  id="event-tags"
                  value={newEvent.tags.join(", ")}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      tags: e.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter((tag) => tag),
                    })
                  }
                  placeholder="Enter tags separated by commas"
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </DialogClose>

          {createStep === 1 ? (
            <Button
              onClick={() => setCreateStep(2)}
              disabled={
                !newEvent.title || !newEvent.description || !newEvent.date
              }
            >
              Next
            </Button>
          ) : createStep === 2 && newEvent.eventType === "SOCIAL" ? (
            <>
              <Button variant="outline" onClick={() => setCreateStep(1)}>
                Back
              </Button>
              <Button
                onClick={() => setCreateStep(3)}
                disabled={newEvent.sessions.length === 0}
              >
                Next
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() =>
                  setCreateStep(newEvent.eventType === "SOCIAL" ? 2 : 1)
                }
              >
                Back
              </Button>

              <Button
                onClick={onCreateEvent}
                disabled={actionLoading.create}
              >
                {actionLoading.create ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Event
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}