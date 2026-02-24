"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Video, PartyPopper, ArrowLeft, Upload } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { EventType, INewEvent } from "@/types/event";
import { UserSelect } from "@/components/ui/user-select";
import { fileToBase64, uploadImage } from "@/lib/upload";
import { useTranslations } from "next-intl";
import moment from "moment";
import { UserRole } from "@/enums";



interface ActionLoading {
  create: boolean;
  [key: string]: boolean;
}

interface CreateEventDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  createStep: number;
  setCreateStep: (step: number) => void;
  newEvent: INewEvent;
  setNewEvent: (event: INewEvent | ((prev: INewEvent) => INewEvent)) => void;
  actionLoading: ActionLoading;
  onCreateEvent: () => Promise<void>;
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
}: CreateEventDialogProps) {
  const t = useTranslations("dashboard.admin");
  const [eventType, setEventType] = useState<"Webinar" | "Social" | null>(null);
  const [date, setDate] = useState<Date>();
  const [uploading, setUploading] = useState(false);

  // Sync date with newEvent
  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      setNewEvent((prev) => ({
        ...prev,
        date: moment(selectedDate).format("YYYY-MM-DD"),
      }));
    }
  };

  const handleEventTypeSelect = (type: "Webinar" | "Social") => {
    setEventType(type);
    setNewEvent((prev) => ({
      ...prev,
      eventType: type === "Webinar" ? EventType.WEBINAR : EventType.SOCIAL,
      // Auto-set defaults for webinars
      ...(type === "Webinar"
        ? {
          location: "online",
          isPublic: true,
          accessType: "Free",
        }
        : {}),
    }));
  };

  const handleNext = () => {
    if (createStep === 1 && eventType) {
      setCreateStep(2);
    }
  };

  const handleBack = () => {
    setCreateStep(1);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateEvent();
    // Reset state
    setCreateStep(1);
    setEventType(null);
    setDate(undefined);
  };

  const handleSelectOrganizer = (userId: string | null) => {
    setNewEvent((prev) => ({ ...prev, organizerId: userId || "" }));
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const base64Promises = Array.from(files).map((file) => fileToBase64(file));
      const base64Images = await Promise.all(base64Promises);
      setNewEvent((prev) => ({
        ...prev,
        images: [...prev.images, ...base64Images],
      }));
    } catch (error) {
      console.error("Error processing files:", error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = newEvent.images.filter((_, i) => i !== index);
    setNewEvent((prev) => ({ ...prev, images: updatedImages }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleCreate}>
          <DialogHeader>
            <DialogTitle>{t("createEvent")}</DialogTitle>
            <DialogDescription>
              {t("createFirstEvent")}
            </DialogDescription>
          </DialogHeader>

          {createStep === 1 && (
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-4">{t("stepOf", { current: 1, total: 2 })}</p>
              <h3 className="font-semibold mb-2">{t("chooseEventType")}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t("selectEventTypeDesc")}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Card
                  className={cn(
                    "p-6 flex flex-col items-center justify-center cursor-pointer",
                    eventType === "Webinar" &&
                    "border-primary ring-2 ring-primary"
                  )}
                  onClick={() => handleEventTypeSelect("Webinar")}
                >
                  <Video className="h-8 w-8 mb-2 text-primary" />
                  <p className="font-semibold">{t("webinar")}</p>
                  <p className="text-xs text-muted-foreground text-center">
                    {t("webinarDesc")}
                  </p>
                </Card>
                <Card
                  className={cn(
                    "p-6 flex flex-col items-center justify-center cursor-pointer",
                    eventType === "Social" &&
                    "border-primary ring-2 ring-primary"
                  )}
                  onClick={() => handleEventTypeSelect("Social")}
                >
                  <PartyPopper className="h-8 w-8 mb-2 text-primary" />
                  <p className="font-semibold">{t("socialEvent")}</p>
                  <p className="text-xs text-muted-foreground text-center">
                    {t("socialEventDesc")}
                  </p>
                </Card>
              </div>
            </div>
          )}

          {createStep === 2 && (
            <div className="py-4 grid gap-4">
              <p className="text-sm text-muted-foreground">{t("stepOf", { current: 2, total: 2 })}</p>
              <div className="space-y-2">
                <Label htmlFor="event-name">{t("eventName")}</Label>
                <Input
                  id="event-name"
                  value={newEvent.title || ""}
                  onChange={(e) =>
                    setNewEvent((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-description">{t("eventDescription")}</Label>
                <Textarea
                  id="event-description"
                  value={newEvent.description || ""}
                  onChange={(e) =>
                    setNewEvent((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t("eventImage")}</Label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="dropzone-file"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/50"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">{t("clickToUpload")}</span>{" "}
                        {t("orDragAndDrop")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        SVG, PNG, JPG or GIF (MAX. 800x400px)
                      </p>
                      {uploading && (
                        <p className="text-sm text-green-600 mt-2">
                          {t("uploadingImages")}
                        </p>
                      )}
                    </div>
                    <input
                      id="dropzone-file"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      disabled={uploading}
                    />
                  </label>
                </div>
                {newEvent.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {newEvent.images.map((imageUrl: string, index: number) => (
                      <div key={index} className="relative">
                        <img
                          src={imageUrl}
                          alt={`Event image ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("date")}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        {date ? format(date, "PPP") : <span>{t("pickADate")}</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">{t("time")}</Label>
                  <Input id="time" type="time" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">{t("location")}</Label>
                  <Select
                    onValueChange={(value) =>
                      setNewEvent((prev) => ({ ...prev, location: value }))
                    }
                    defaultValue={
                      eventType === "Webinar" ? "online" : undefined
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("location")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">{t("online")}</SelectItem>
                      <SelectItem value="in-person">{t("inPerson")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="access-type">{t("accessType")}</Label>
                  <Select
                    onValueChange={(value: "Free" | "Premium") =>
                      setNewEvent((prev) => ({ ...prev, accessType: value }))
                    }
                    defaultValue={eventType === "Webinar" ? "Free" : undefined}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("accessType")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Free">{t("free")}</SelectItem>
                      <SelectItem value="Premium">{t("premium")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("eventHost")}</Label>
                <UserSelect
                  value={newEvent.organizerId}
                  onChange={(user: any) => {
                    handleSelectOrganizer(user?.id || null);
                  }}
                  role={UserRole.COACH}
                  placeholder={t("selectOrganizer")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lumaEventLink">{t("lumaEventLink")} *</Label>
                <Input
                  id="lumaEventLink"
                  type="url"
                  placeholder="https://lu.ma/your-event"
                  value={newEvent.lumaEventLink || ""}
                  onChange={(e) =>
                    setNewEvent((prev) => ({
                      ...prev,
                      lumaEventLink: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              {newEvent.accessType === "Premium" && <div className="space-y-2">
                <Label htmlFor="price">{t("pricePerGuest")}</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="e.g., 25"
                  required
                  value={newEvent.price || ""}
                  onChange={(e) =>
                    setNewEvent((prev) => ({
                      ...prev,
                      price: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>}
              {eventType === "Social" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="whatToBring">{t("whatToBring")}</Label>
                    <Textarea
                      id="whatToBring"
                      placeholder={t("bringDesc")}
                      value={newEvent.whatToBring || ""}
                      onChange={(e) =>
                        setNewEvent((prev) => ({
                          ...prev,
                          whatToBring: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="additionalInfo">
                      {t("additionalInfo")}
                    </Label>
                    <Textarea
                      id="additionalInfo"
                      placeholder={t("infoDesc")}
                      value={newEvent.additionalInfo || ""}
                      onChange={(e) =>
                        setNewEvent((prev) => ({
                          ...prev,
                          additionalInfo: e.target.value,
                        }))
                      }
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            {createStep === 1 && (
              <>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    {t("cancel")}
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!eventType}
                >
                  {t("next")}
                </Button>
              </>
            )}
            {createStep === 2 && (
              <>
                <Button type="button" variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> {t("back")}
                </Button>
                <Button type="submit" disabled={actionLoading.create}>
                  {actionLoading.create ? t("creating") : t("createEventBtn")}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
