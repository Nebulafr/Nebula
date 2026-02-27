 
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface EventDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEvent: any;
  dialogEventType: string;
  setDialogEventType: (type: string) => void;
  actionLoading: Record<string, boolean>;
  onSaveChanges: () => void;
}

export function EventDetailsDialog({
  isOpen,
  onOpenChange,
  selectedEvent,
  dialogEventType,
  setDialogEventType,
  actionLoading,
  onSaveChanges,
}: EventDetailsDialogProps) {
  const t = useTranslations("dashboard.admin");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        {selectedEvent && (
          <>
            <DialogHeader>
              <DialogTitle>{selectedEvent.title}</DialogTitle>
              <DialogDescription asChild>
                <div className="flex items-center gap-2 mt-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={selectedEvent?.organizer?.avatarUrl} />
                    <AvatarFallback>
                      {selectedEvent?.organizer?.fullName?.charAt(0) || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <span>
                    {selectedEvent?.organizer?.fullName || t("statusUnknown")}
                  </span>
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="event-description" className="text-right pt-2">
                  {t("eventDescription")}
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
                  {t("eventType")}
                </Label>
                <Select
                  value={dialogEventType}
                  onValueChange={setDialogEventType}
                >
                  <SelectTrigger id="event-type" className="col-span-3">
                    <SelectValue placeholder={t("selectEventTypeDesc")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEBINAR">{t("webinar")}</SelectItem>
                    <SelectItem value="SOCIAL">{t("socialEvent")}</SelectItem>
                    <SelectItem value="WORKSHOP">{t("workshop") || "Workshop"}</SelectItem>
                    <SelectItem value="NETWORKING">{t("networking") || "Networking"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  {t("cancel")}
                </Button>
              </DialogClose>
              <Button
                type="button"
                onClick={onSaveChanges}
                disabled={actionLoading[selectedEvent?.id]}
              >
                {actionLoading[selectedEvent?.id] ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("saving")}
                  </>
                ) : (
                  t("saveChanges")
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}