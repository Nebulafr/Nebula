"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SessionCarousel } from "./session-carousel";
import { EventTypeSelection } from "./event-type-selection";
import { EventBasicDetails } from "./event-basic-details";
import { FormStepFooter } from "./form-step-footer";
import { EventType } from "@/types/event";

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
  googleAccessToken?: string;
  onTriggerGoogleAuth?: (eventType: string, step: number) => void;
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
  googleAccessToken,
  onTriggerGoogleAuth,
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
            Step {createStep} of{" "}
            {newEvent.eventType === EventType.SOCIAL ? 3 : 2}
          </p>
        </div>

        {/* STEP 1 — EVENT TYPE SELECTION */}
        {createStep === 1 && (
          <EventTypeSelection
            selectedEventType={newEvent.eventType}
            onEventTypeSelect={(eventType) => {
              setNewEvent({ ...newEvent, eventType });
            }}
          />
        )}

        {/* STEP 2 — BASIC DETAILS */}
        {(createStep === 2 && newEvent.eventType === EventType.WEBINAR) ||
        (createStep === 2 && newEvent.eventType === EventType.SOCIAL) ? (
          <EventBasicDetails newEvent={newEvent} setNewEvent={setNewEvent} />
        ) : null}

        {/* STEP 3 — SESSIONS SETUP (SOCIAL EVENTS ONLY) */}
        {createStep === 3 && newEvent.eventType === EventType.SOCIAL && (
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

        <FormStepFooter
          currentStep={createStep}
          totalSteps={newEvent.eventType === EventType.SOCIAL ? 3 : 2}
          eventType={newEvent.eventType}
          canGoNext={
            createStep === 1
              ? Boolean(newEvent.eventType)
              : createStep === 3 && newEvent.eventType === EventType.SOCIAL
              ? newEvent.sessions.length > 0
              : true
          }
          canSubmit={true}
          isSubmitting={actionLoading.create}
          onCancel={() => onOpenChange(false)}
          onBack={() => {
            if (createStep === 3 && newEvent.eventType === EventType.SOCIAL) {
              setCreateStep(2);
            } else if (createStep === 2) {
              setCreateStep(1);
            }
          }}
          onNext={() => {
            if (createStep === 1) {
              if (newEvent.eventType === EventType.WEBINAR) {
                if (onTriggerGoogleAuth) {
                  onTriggerGoogleAuth(EventType.WEBINAR, 2);
                }
              } else if (newEvent.eventType === EventType.SOCIAL) {
                setCreateStep(2);
              }
            } else if (
              createStep === 2 &&
              newEvent.eventType === EventType.SOCIAL
            ) {
              setCreateStep(3);
            }
          }}
          onSubmit={onCreateEvent}
        />
      </DialogContent>
    </Dialog>
  );
}
