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
import {
  storeGoogleAccessToken,
  getGoogleAccessToken,
} from "@/lib/auth-storage";
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
  const [currentSessionIndex, setCurrentSessionIndex] = useState<number>(0);
  const [googleAccessToken, setGoogleAccessToken] = useState<string>(
    getGoogleAccessToken() || ""
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
    try {
      await createEventMutation.mutateAsync(data);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleUpdateEventAction = async (id: string, data: any) => {
    try {
      await updateEventMutation.mutateAsync({ id, updateData: data });
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleDeleteEventAction = async (id: string) => {
    try {
      await deleteEventMutation.mutateAsync(id);
      return true;
    } catch (error) {
      return false;
    }
  };

  const actionLoading = {
    create: createEventMutation.isPending,
    [selectedEvent?.id]: updateEventMutation.isPending,
    [`delete-${selectedEvent?.id}`]: deleteEventMutation.isPending,
  };

  // Handle Google OAuth callback and URL parameters
  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const eventType = searchParams.get("eventType");
    const step = searchParams.get("step");

    if (accessToken) {
      storeGoogleAccessToken(accessToken);
      setGoogleAccessToken(accessToken);
      toast.success("Google Calendar connected successfully!");
    }

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

    // Clean URL after processing
    if (accessToken) {
      const url = new URL(window.location.href);
      url.searchParams.delete("access_token");
      url.searchParams.delete("refresh_token");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  // Fetch admin events with current filters
  useEffect(() => {
    fetchAdminEvents();
  }, [searchTerm, activeTab, fetchAdminEvents]);

  // Helper function to trigger Google Calendar authentication for webinars
  const triggerGoogleAuth = (eventType: string, step: number) => {
    // Check if we already have a stored Google access token
    const existingToken = getGoogleAccessToken();
    if (existingToken) {
      // Skip auth and go directly to the next step
      setGoogleAccessToken(existingToken);
      setCreateStep(step);
      toast.info("Using existing Google Calendar connection");
      return;
    }

    const authUrl = new URL(
      "/api/auth/google-calendar",
      window.location.origin
    );
    authUrl.searchParams.set("eventType", eventType);
    authUrl.searchParams.set("step", step.toString());
    window.location.href = authUrl.toString();
  };

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
    sessions: [] as Array<{
      date: string;
      time: string;
      price: string;
      currency: string;
      spotsLeft: string;
      description: string;
    }>,
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
        // Include Google access token for webinar events
        ...(newEvent.eventType === EventType.WEBINAR && googleAccessToken
          ? { googleAccessToken }
          : {}),
        ...(newEvent.eventType === EventType.SOCIAL &&
          newEvent.sessions.length > 0 && {
            sessions: newEvent.sessions.map((session) => ({
              date: session.date,
              time: session.time,
              price: session.price ? parseFloat(session.price) : 0,
              currency: session.currency,
              spotsLeft: session.spotsLeft
                ? parseInt(session.spotsLeft)
                : undefined,
              description: session.description || undefined,
            })),
          }),
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
          sessions: [],
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

  const addSession = () => {
    const newSessions = [
      ...newEvent.sessions,
      {
        date: "",
        time: "",
        price: "0",
        currency: "EUR",
        spotsLeft: "",
        description: "",
      },
    ];
    setNewEvent({
      ...newEvent,
      sessions: newSessions,
    });
    setCurrentSessionIndex(newSessions.length - 1);
  };

  const updateSession = (index: number, field: string, value: string) => {
    const updatedSessions = [...newEvent.sessions];
    updatedSessions[index] = { ...updatedSessions[index], [field]: value };
    setNewEvent({ ...newEvent, sessions: updatedSessions });
  };

  const removeSession = (index: number) => {
    const updatedSessions = newEvent.sessions.filter((_, i) => i !== index);
    setNewEvent({ ...newEvent, sessions: updatedSessions });
    if (currentSessionIndex >= updatedSessions.length) {
      setCurrentSessionIndex(Math.max(0, updatedSessions.length - 1));
    }
  };

  const navigateToSession = (index: number) => {
    setCurrentSessionIndex(index);
  };

  const goToPreviousSession = () => {
    setCurrentSessionIndex(Math.max(0, currentSessionIndex - 1));
  };

  const goToNextSession = () => {
    setCurrentSessionIndex(
      Math.min(newEvent.sessions.length - 1, currentSessionIndex + 1)
    );
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
        currentSessionIndex={currentSessionIndex}
        setCurrentSessionIndex={setCurrentSessionIndex}
        onAddSession={addSession}
        onUpdateSession={updateSession}
        onRemoveSession={removeSession}
        onNavigateToSession={navigateToSession}
        onGoToPreviousSession={goToPreviousSession}
        onGoToNextSession={goToNextSession}
        googleAccessToken={googleAccessToken}
        onTriggerGoogleAuth={triggerGoogleAuth}
      />
    </div>
  );
}
