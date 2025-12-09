"use client";

import React, { useState } from "react";
import { useEvents } from "@/hooks/use-events";
import { toast } from "react-toastify";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  MoreHorizontal,
  PlusCircle,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { UserProvider } from "@/contexts/user-context";
import { UserSelect } from "@/components/ui/user-select";

export default function AdminEventsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [dialogEventType, setDialogEventType] = useState("");
  const [createStep, setCreateStep] = useState<number>(1);

  const {
    events,
    loading,
    error,
    refetch,
    actionLoading,
    createEvent: handleCreateEventAction,
    updateEvent: handleUpdateEventAction,
    deleteEvent: handleDeleteEventAction,
  } = useEvents({
    search: searchTerm,
    eventType: activeTab === "all" ? undefined : activeTab.toUpperCase(),
  });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    eventType: "WEBINAR" as const,
    date: "",
    organizerId: "",
    location: "",
    images: [] as string[],
    whatToBring: "",
    additionalInfo: "",
    isPublic: true,
    maxAttendees: "",
    tags: [] as string[],
  });

  const handleEventAction = async (id: string, newStatus: string) => {
    const success = await handleUpdateEventAction(id, {
      status: newStatus as any,
    });
    if (success) {
      toast.success("Event updated successfully");
    } else {
      toast.error("Failed to update event");
    }
  };

  const handleViewDetails = (event: any) => {
    setSelectedEvent(event);
    setDialogEventType(event.eventType);
    setIsDetailsDialogOpen(true);
  };

  const handleSaveChanges = async () => {
    if (selectedEvent) {
      const success = await handleUpdateEventAction(selectedEvent.id, {
        eventType: dialogEventType as any,
      });
      if (success) {
        setIsDetailsDialogOpen(false);
        setSelectedEvent(null);
        toast.success("Event updated successfully");
      } else {
        toast.error("Failed to update event");
      }
    }
  };

  const handleCreateEvent = async () => {
    if (newEvent.title && newEvent.description && newEvent.date) {
      const success = await handleCreateEventAction({
        title: newEvent.title,
        description: newEvent.description,
        eventType: newEvent.eventType,
        date: new Date(newEvent.date),
        location: newEvent.location || undefined,
        images: newEvent.images,
        whatToBring: newEvent.whatToBring || undefined,
        additionalInfo: newEvent.additionalInfo || undefined,
        isPublic: newEvent.isPublic,
        maxAttendees: newEvent.maxAttendees
          ? parseInt(newEvent.maxAttendees)
          : undefined,
        tags: newEvent.tags,
        organizerId: newEvent.organizerId || undefined,
      });

      if (success) {
        setNewEvent({
          title: "",
          description: "",
          eventType: "WEBINAR",
          date: "",
          organizerId: "",
          location: "",
          images: [],
          whatToBring: "",
          additionalInfo: "",
          isPublic: true,
          maxAttendees: "",
          tags: [],
        });
        setIsCreateDialogOpen(false);
        toast.success("Event created successfully");
      } else {
        toast.error("Failed to create event");
      }
    }
  };

  const handleOpenCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  const handleDeleteEvent = async (id: string) => {
    const success = await handleDeleteEventAction(id);
    if (success) {
      toast.success("Event deleted successfully");
    } else {
      toast.error("Failed to delete event");
    }
  };

  const filteredEvents = events;

  const eventTypes = ["all", "webinar", "social", "workshop", "networking"];

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-destructive">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <UserProvider>
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <Card>
          <CardHeader>
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
                <Button onClick={handleOpenCreateDialog}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Event
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Organizer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          event.eventType === "WEBINAR"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {event.eventType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={event.organizer?.avatarUrl} />
                          <AvatarFallback>
                            {event.organizer?.fullName?.charAt(0) || "A"}
                          </AvatarFallback>
                        </Avatar>
                        <span>{event.organizer?.fullName || "Unknown"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(event.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          event.status === "UPCOMING"
                            ? "default"
                            : event.status === "COMPLETED"
                            ? "outline"
                            : event.status === "CANCELLED"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {event.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => handleViewDetails(event)}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {event.status === "PENDING" && (
                            <>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleEventAction(event.id, "UPCOMING")
                                }
                                disabled={actionLoading[event.id]}
                              >
                                {actionLoading[event.id] ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                )}
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() =>
                                  handleEventAction(event.id, "CANCELLED")
                                }
                                disabled={actionLoading[event.id]}
                              >
                                {actionLoading[event.id] ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <XCircle className="mr-2 h-4 w-4" />
                                )}
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {event.status === "UPCOMING" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleEventAction(event.id, "CANCELLED")
                              }
                              disabled={actionLoading[event.id]}
                            >
                              {actionLoading[event.id] ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="mr-2 h-4 w-4" />
                              )}
                              Cancel
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteEvent(event.id)}
                            disabled={actionLoading[`delete-${event.id}`]}
                          >
                            {actionLoading[`delete-${event.id}`] ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="mr-2 h-4 w-4" />
                            )}
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Dialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
        >
          <DialogContent className="sm:max-w-[625px]">
            {selectedEvent && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedEvent.title}</DialogTitle>
                  <DialogDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={selectedEvent?.organizer?.avatarUrl}
                        />
                        <AvatarFallback>
                          {selectedEvent?.organizer?.fullName?.charAt(0) || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <span>
                        {selectedEvent?.organizer?.fullName || "Unknown"}
                      </span>
                    </div>
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label
                      htmlFor="event-description"
                      className="text-right pt-2"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="event-description"
                      className="col-span-3"
                      readOnly
                      defaultValue={selectedEvent?.description}
                      rows={5}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="event-type" className="text-right">
                      Event Type
                    </Label>
                    <Select
                      value={dialogEventType}
                      onValueChange={setDialogEventType}
                    >
                      <SelectTrigger id="event-type" className="col-span-3">
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
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDetailsDialogOpen(false)}
                    >
                      Close
                    </Button>
                  </DialogClose>
                  <Button
                    type="button"
                    onClick={handleSaveChanges}
                    disabled={actionLoading[selectedEvent?.id]}
                  >
                    {actionLoading[selectedEvent?.id] ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
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
                Step {createStep} of 2
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
                      // includeCoaches={true}
                      // includeStudents={true}
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

            {/* STEP 2 — ADVANCED DETAILS */}
            {createStep === 2 && (
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
                  <Label
                    htmlFor="event-what-to-bring"
                    className="text-right pt-2"
                  >
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
                  <Label
                    htmlFor="event-additional-info"
                    className="text-right pt-2"
                  >
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
                  onClick={() => setIsCreateDialogOpen(false)}
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
              ) : (
                <>
                  <Button variant="outline" onClick={() => setCreateStep(1)}>
                    Back
                  </Button>

                  <Button
                    onClick={handleCreateEvent}
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
      </div>
    </UserProvider>
  );
}
