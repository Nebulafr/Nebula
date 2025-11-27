"use client";

import React, { useState } from "react";
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
  PauseCircle,
  PlayCircle,
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

const initialEvents = [
  {
    title: "Problem-Solving & Structured Thinking",
    description:
      "A deep dive into the frameworks and mental models used by top consultants to tackle complex business challenges. This interactive session will include real-world case studies and live problem-solving exercises.",
    type: "Webinar",
    organizer: {
      name: "Adrian Cucurella",
      avatar: "https://i.pravatar.cc/40?u=adrian-cucurella",
    },
    date: "2024-08-04",
    status: "Upcoming",
  },
  {
    title: "Hiking Adventure",
    description:
      "Join fellow members for a scenic hike. A great opportunity to network and enjoy the outdoors.",
    type: "Social",
    organizer: {
      name: "Maxwell Boyt",
      avatar: "https://i.pravatar.cc/40?u=maxwell",
    },
    date: "2024-07-28",
    status: "Upcoming",
  },
  {
    title: "From Founder to VC",
    description:
      "An exclusive talk with a seasoned entrepreneur who made the leap into venture capital. Learn about their journey, insights on what VCs look for, and tips for fundraising.",
    type: "Webinar",
    organizer: {
      name: "William Harris",
      avatar: "https://i.pravatar.cc/40?u=william",
    },
    date: "2024-07-15",
    status: "Past",
  },
  {
    title: "New Event Proposal",
    description:
      "A proposal for a new workshop series focused on advanced data analytics and machine learning applications in business.",
    type: "Webinar",
    organizer: {
      name: "Sarah Chen",
      avatar: "https://i.pravatar.cc/40?u=sarah-chen",
    },
    date: "2024-08-10",
    status: "Pending",
  },
  {
    title: "Museum Visit",
    description:
      "A guided tour of the new modern art exhibition, followed by a casual get-together at a nearby cafe.",
    type: "Social",
    organizer: {
      name: "Juliana Sorowitz",
      avatar: "https://i.pravatar.cc/40?u=juliana",
    },
    date: "2024-07-20",
    status: "Cancelled",
  },
  {
    title: "Networking Mixer",
    description:
      "An evening mixer for all members to connect and expand their professional networks.",
    type: "Social",
    organizer: {
      name: "Admin",
      avatar: "https://i.pravatar.cc/40?u=admin",
    },
    date: "2024-08-15",
    status: "Paused",
  },
];

type Event = (typeof initialEvents)[0];

export default function AdminEventsPage() {
  const [events, setEvents] = useState(initialEvents);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [dialogEventType, setDialogEventType] = useState("");
  
  // Create event modal state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    type: "Webinar",
    date: "",
    organizer: {
      name: "Admin",
      avatar: "https://i.pravatar.cc/40?u=admin",
    },
  });

  const handleEventAction = (title: string, newStatus: string) => {
    setEvents(
      events.map((e) => (e.title === title ? { ...e, status: newStatus } : e))
    );
  };

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event);
    setDialogEventType(event.type);
    setIsDetailsDialogOpen(true);
  };

  const handleSaveChanges = () => {
    if (selectedEvent) {
      setEvents(
        events.map((e) =>
          e.title === selectedEvent.title ? { ...e, type: dialogEventType } : e
        )
      );
      setIsDetailsDialogOpen(false);
      setSelectedEvent(null);
    }
  };

  const handleCreateEvent = () => {
    if (newEvent.title && newEvent.description && newEvent.date) {
      const eventToAdd = {
        ...newEvent,
        status: "Pending",
      };
      setEvents([...events, eventToAdd]);
      setNewEvent({
        title: "",
        description: "",
        type: "Webinar",
        date: "",
        organizer: {
          name: "Admin",
          avatar: "https://i.pravatar.cc/40?u=admin",
        },
      });
      setIsCreateDialogOpen(false);
    }
  };

  const handleOpenCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  const filteredEvents = events.filter((event) => {
    const typeMatch =
      activeTab === "all" || event.type.toLowerCase() === activeTab;
    const searchMatch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.organizer.name.toLowerCase().includes(searchTerm.toLowerCase());
    return typeMatch && searchMatch;
  });

  const eventTypes = ["all", "webinar", "social"];

  return (
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
                >
                  {type === "all" ? "All Events" : type}
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
                <TableRow key={event.title}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        event.type === "Webinar" ? "default" : "secondary"
                      }
                    >
                      {event.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={event.organizer.avatar} />
                        <AvatarFallback>
                          {event.organizer.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{event.organizer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{event.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        event.status === "Upcoming"
                          ? "default"
                          : event.status === "Past"
                          ? "outline"
                          : event.status === "Cancelled" ||
                            event.status === "Rejected"
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
                        {event.status === "Pending" && (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                handleEventAction(event.title, "Upcoming")
                              }
                            >
                              <CheckCircle className="mr-2 h-4 w-4" /> Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() =>
                                handleEventAction(event.title, "Rejected")
                              }
                            >
                              <XCircle className="mr-2 h-4 w-4" /> Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        {event.status === "Upcoming" && (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                handleEventAction(event.title, "Paused")
                              }
                            >
                              <PauseCircle className="mr-2 h-4 w-4" /> Pause
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleEventAction(event.title, "Cancelled")
                              }
                            >
                              <XCircle className="mr-2 h-4 w-4" /> Cancel
                            </DropdownMenuItem>
                          </>
                        )}
                        {event.status === "Paused" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleEventAction(event.title, "Upcoming")
                            }
                          >
                            <PlayCircle className="mr-2 h-4 w-4" /> Resume
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
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
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedEvent.title}</DialogTitle>
                <DialogDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={selectedEvent.organizer.avatar} />
                      <AvatarFallback>
                        {selectedEvent.organizer.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{selectedEvent.organizer.name}</span>
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
                    defaultValue={selectedEvent.description}
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
                      <SelectItem value="Webinar">Webinar</SelectItem>
                      <SelectItem value="Social">Social</SelectItem>
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
                <Button type="button" onClick={handleSaveChanges}>
                  Save Changes
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Event Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Create a new event for members to participate in.
            </DialogDescription>
          </DialogHeader>
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
                value={newEvent.type}
                onValueChange={(value) =>
                  setNewEvent({ ...newEvent, type: value })
                }
              >
                <SelectTrigger id="event-type-new" className="col-span-3">
                  <SelectValue placeholder="Select an event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Webinar">Webinar</SelectItem>
                  <SelectItem value="Social">Social</SelectItem>
                  <SelectItem value="Workshop">Workshop</SelectItem>
                  <SelectItem value="Networking">Networking</SelectItem>
                </SelectContent>
              </Select>
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
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleCreateEvent}
              disabled={
                !newEvent.title || !newEvent.description || !newEvent.date
              }
            >
              Create Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
