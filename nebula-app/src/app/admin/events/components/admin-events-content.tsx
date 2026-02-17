"use client";

import React, { useState, useEffect } from "react";
import {
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useAdminEvents,
} from "@/hooks";
import { toast } from "react-toastify";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { EventsHeader } from "./events-header";
import { EventsTable } from "./events-table";
import { EventDetailsDialog } from "./event-details-dialog";
import { CreateEventDialog } from "./create-event-dialog";
import { useSearchParams } from "next/navigation";
import { EventType } from "@/types/event";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { AdminPagination } from "../../components/admin-pagination";

export default function AdminEventsContent() {
  const t = useTranslations("dashboard.admin");
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [eventToDelete, setEventToDelete] = useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [dialogEventType, setDialogEventType] = useState("");
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  // URL-based form state management
  const urlEventType = searchParams.get("eventType");
  const urlStep = searchParams.get("step");
  const [createStep, setCreateStep] = useState<number>(
    urlStep ? parseInt(urlStep) : 1
  );

  const {
    data: eventsResponse,
    isLoading: loading,
    isRefetching,
    error,
    refetch: fetchAdminEvents,
  } = useAdminEvents({
    search: searchTerm || undefined,
    eventType: activeTab === "all" ? undefined : activeTab.toUpperCase(),
    page,
    limit,
  });

  const events = eventsResponse?.events || [];
  const pagination = eventsResponse?.pagination;
  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();
  const deleteEventMutation = useDeleteEvent();

  const handleCreateEventAction = async (data: any) => {
    setActiveActionId("create");
    try {
      return await createEventMutation.mutateAsync(data);
    } finally {
      setActiveActionId(null);
    }
  };

  const handleUpdateEventAction = async (id: string, data: any) => {
    setActiveActionId(id);
    try {
      return await updateEventMutation.mutateAsync({
        id,
        updateData: data,
      });
    } finally {
      setActiveActionId(null);
    }
  };

  const handleDeleteEventAction = async (id: string) => {
    setActiveActionId(`delete-${id}`);
    try {
      return await deleteEventMutation.mutateAsync(id);
    } finally {
      setActiveActionId(null);
    }
  };

  const actionLoading: { create: boolean;[key: string]: boolean } = {
    create: createEventMutation.isPending,
  };

  if (activeActionId) {
    actionLoading[activeActionId] = true;
  }

  if (eventToDelete) {
    actionLoading[`delete-${eventToDelete.id}`] = deleteEventMutation.isPending;
  }

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

  // Fetch admin events with current filters and reset page
  useEffect(() => {
    setPage(1);
    fetchAdminEvents();
  }, [searchTerm, activeTab, fetchAdminEvents]);

  useEffect(() => {
    fetchAdminEvents();
  }, [page, fetchAdminEvents]);

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
    price: 0,
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
        price: newEvent.price,
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
          price: 0,
        });
        setIsCreateDialogOpen(false);
      }
    }
  };

  const handleOpenCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  const handleDeleteEvent = (id: string) => {
    const event = events.find((e: any) => e.id === id);
    if (event) {
      setEventToDelete(event);
    }
  };

  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirmDelete = async () => {
    if (eventToDelete && !isProcessing) {
      setIsProcessing(true);
      try {
        await handleDeleteEventAction(eventToDelete.id);
        toast.success(t("eventDeletedSuccess") || "Event deleted successfully");
        setEventToDelete(null); // Close dialog immediately on success
      } catch (error: any) {
        // Error already toasted by mutation hook
        if (error?.statusCode === 404 || error?.message?.includes("not found")) {
          // If already gone, just refetch
          fetchAdminEvents();
          setEventToDelete(null);
        }
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const filteredEvents = events;

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-destructive">
            {error?.message || t("failedToLoadEvents")}
          </div>
        </div>
      </div>
    );
  }

  const isPageLoading = loading || (isRefetching && !activeActionId);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <Card>
        <CardHeader>
          <EventsHeader
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            loading={isPageLoading}
            onCreateEvent={handleOpenCreateDialog}
          />
        </CardHeader>
        <CardContent className="relative">
          {isPageLoading && events.length > 0 && (
            <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          <EventsTable
            events={filteredEvents}
            actionLoading={actionLoading}
            onViewDetails={handleViewDetails}
            onEventAction={handleEventAction}
            onDeleteEvent={handleDeleteEvent}
          />

          {pagination && (
            <AdminPagination
              total={pagination.total}
              page={page}
              limit={limit}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
              isLoading={loading}
            />
          )}
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

      <AlertDialog
        open={!!eventToDelete}
        onOpenChange={(open) => !open && setEventToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("areYouSure")}</AlertDialogTitle>
            <AlertDialogDescription>
              {eventToDelete && (t("deleteEventDesc", { title: eventToDelete.title }) || `Are you sure you want to delete the event "${eventToDelete.title}"? This action cannot be undone.`)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>{t("cancel")}</AlertDialogCancel>
            <Button
              onClick={handleConfirmDelete}
              variant="destructive"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("delete")
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
