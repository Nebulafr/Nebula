"use client";

import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { PlusCircle, Loader2 } from "lucide-react";
import { EventType } from "@/types/event";

interface FormStepFooterProps {
  currentStep: number;
  totalSteps: number;
  eventType: EventType;
  canGoNext?: boolean;
  canSubmit?: boolean;
  isSubmitting?: boolean;
  onCancel: () => void;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  nextButtonText?: string;
  submitButtonText?: string;
}

export function FormStepFooter({
  currentStep,
  totalSteps,
  eventType,
  canGoNext = true,
  canSubmit = true,
  isSubmitting = false,
  onCancel,
  onBack,
  onNext,
  onSubmit,
  nextButtonText = "Next",
  submitButtonText = "Create Event",
}: FormStepFooterProps) {
  const isFirstStep = currentStep === 1;
  const isFinalStep = currentStep === totalSteps;
  const isSessionsStep = currentStep === 3 && eventType === EventType.SOCIAL;

  return (
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </DialogClose>

      {/* Back Button - Show for all steps except step 1 */}
      {!isFirstStep && (
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
      )}

      {/* Primary Action Button */}
      {isFinalStep ? (
        // Final step: Submit button
        <Button onClick={onSubmit} disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <PlusCircle className="mr-2 h-4 w-4" />
              {submitButtonText}
            </>
          )}
        </Button>
      ) : (
        // Next button for non-final steps
        <Button onClick={onNext} disabled={!canGoNext}>
          {nextButtonText}
        </Button>
      )}
    </DialogFooter>
  );
}
