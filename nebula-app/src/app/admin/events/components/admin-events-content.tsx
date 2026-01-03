"use client";

import React, { useState, useEffect } from "react";
import {
  useEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from "@/hooks";
import { toast } from "react-toastify";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { EventsHeader } from "./events-header";
import { EventsTable } from "./events-table";
import { EventDetailsDialog } from "./event-details-dialog";
import { CreateEventDialog } from "./create-event-dialog";
import { useSearchParams } from "next/navigation";
import { EventType } from "@/types/event";

export default function AdminEventsContent() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [dialogEventType, setDialogEventType] = useState("");

  // URL-based form state management
  const urlEventType = searchParams.get("eventType");
  const urlStep = searchParams.get("step");
  const [createStep, setCreateStep] = useState<number>(
    urlStep ? parseInt(urlStep) : 1
  );

  const {
    data: eventsResponse,
    isLoading: loading,
    error,
    refetch: fetchAdminEvents,
  } = useEvents({
    search: searchTerm || undefined,
    status: activeTab === "all" ? undefined : activeTab.toUpperCase(),
    limit: 10,
  });

  const events = eventsResponse?.data?.events || [];
  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();
  const deleteEventMutation = useDeleteEvent();

  const handleCreateEventAction = async (data: any) => {
    return await createEventMutation.mutateAsync(data);
  };

  const handleUpdateEventAction = async (id: string, data: any) => {
    return await updateEventMutation.mutateAsync({
      id,
      updateData: data,
    });
  };

  const handleDeleteEventAction = async (id: string) => {
    return await deleteEventMutation.mutateAsync(id);
  };

  const actionLoading = {
    create: createEventMutation.isPending,
    [selectedEvent?.id]: updateEventMutation.isPending,
    [`delete-${selectedEvent?.id}`]: deleteEventMutation.isPending,
  };

  // Handle URL parameters
  useEffect(() => {
    const eventType = searchParams.get("eventType");
    const step = searchParams.get("step");

    // Update form state based on URL parameters
    if (eventType) {
      setNewEvent((prev) => ({
        ...prev,
        eventType: eventType as EventType,
      }));
    }

    if (step) {
      setCreateStep(parseInt(step));
    }

    // Open dialog if eventType or step is present
    if (eventType || step) {
      setIsCreateDialogOpen(true);
    }
  }, [searchParams]);

  // Fetch admin events with current filters
  useEffect(() => {
    fetchAdminEvents();
  }, [searchTerm, activeTab, fetchAdminEvents]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(
    !!urlEventType || !!urlStep
  );
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    eventType: (urlEventType as EventType) || EventType.WEBINAR,
    date: "",
    organizerId: "",
    location: "",
    images: [] as string[],
    whatToBring: "",
    additionalInfo: "",
    isPublic: true,
    maxAttendees: "",
    tags: [] as string[],
    lumaEventLink: "",
    accessType: "Free",
  });

  const handleEventAction = async (id: string, newStatus: string) => {
    await handleUpdateEventAction(id, {
      status: newStatus as any,
    });
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
      }
    }
  };

  const handleCreateEvent = async () => {
    if (newEvent.title && newEvent.description && newEvent.date) {
      const eventData = {
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
        lumaEventLink: newEvent.lumaEventLink,
        accessType: newEvent.accessType,
      };

      const success = await handleCreateEventAction(eventData);

      if (success) {
        setNewEvent({
          title: "",
          description: "",
          eventType: EventType.WEBINAR,
          date: "",
          organizerId: "",
          location: "",
          images: [],
          whatToBring: "",
          additionalInfo: "",
          isPublic: true,
          maxAttendees: "",
          tags: [],
          lumaEventLink: "",
          accessType: "Free",
        });
        setIsCreateDialogOpen(false);
      }
    }
  };

  const handleOpenCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  const handleDeleteEvent = async (id: string) => {
    await handleDeleteEventAction(id);
  };

  const filteredEvents = events;

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-destructive">
            {error?.message || "Failed to load events"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <Card>
        <CardHeader>
          <EventsHeader
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            loading={loading}
            onCreateEvent={handleOpenCreateDialog}
          />
        </CardHeader>
        <CardContent>
          <EventsTable
            events={filteredEvents}
            actionLoading={actionLoading}
            onViewDetails={handleViewDetails}
            onEventAction={handleEventAction}
            onDeleteEvent={handleDeleteEvent}
          />
        </CardContent>
      </Card>
      <EventDetailsDialog
        isOpen={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        selectedEvent={selectedEvent}
        dialogEventType={dialogEventType}
        setDialogEventType={setDialogEventType}
        actionLoading={actionLoading}
        onSaveChanges={handleSaveChanges}
      />

      <CreateEventDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        createStep={createStep}
        setCreateStep={setCreateStep}
        newEvent={newEvent}
        setNewEvent={setNewEvent}
        actionLoading={actionLoading}
        onCreateEvent={handleCreateEvent}
      />
    </div>
  );
}
