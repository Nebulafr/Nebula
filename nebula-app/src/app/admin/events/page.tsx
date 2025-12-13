"use client";

import React, { useState, useEffect } from "react";
import { useEventsContext } from "@/contexts/events-context";
import { toast } from "react-toastify";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { UserProvider } from "@/contexts/user-context";
import { EventsHeader } from "./components/events-header";
import { EventsTable } from "./components/events-table";
import { EventDetailsDialog } from "./components/event-details-dialog";
import { CreateEventDialog } from "./components/create-event-dialog";

export default function AdminEventsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [dialogEventType, setDialogEventType] = useState("");
  const [createStep, setCreateStep] = useState<number>(1);
  const [currentSessionIndex, setCurrentSessionIndex] = useState<number>(0);

  const {
    events,
    loading,
    error,
    fetchAdminEvents,
    actionLoading,
    createEvent: handleCreateEventAction,
    updateEvent: handleUpdateEventAction,
    deleteEvent: handleDeleteEventAction,
  } = useEventsContext();

  // Fetch admin events with current filters
  useEffect(() => {
    const params = {
      search: searchTerm || undefined,
      eventType: activeTab === "all" ? undefined : activeTab.toUpperCase(),
    };
    
    fetchAdminEvents(params);
  }, [searchTerm, activeTab, fetchAdminEvents]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    eventType: "WEBINAR" as "WEBINAR" | "SOCIAL" | "WORKSHOP" | "NETWORKING",
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
        ...(newEvent.eventType === "SOCIAL" &&
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
    setCurrentSessionIndex(Math.min(newEvent.sessions.length - 1, currentSessionIndex + 1));
  };

  const filteredEvents = events;

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
        />
      </div>
    </UserProvider>
  );
}
