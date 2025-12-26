"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
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
  SelectValue 
} from "@/components/ui/select";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { 
  PlusCircle, 
  Video, 
  PartyPopper, 
  ArrowLeft, 
  Upload 
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { EventType } from "@/types/event";
import { UserSelect } from "@/components/ui/user-select";

interface NewEvent {
  title: string;
  description: string;
  eventType: EventType;
  date: string;
  organizerId: string;
  location: string;
  images: string[];
  whatToBring: string;
  additionalInfo: string;
  isPublic: boolean;
  maxAttendees: string;
  tags: string[];
}

interface ActionLoading {
  create: boolean;
  [key: string]: boolean;
}

interface CreateEventDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  createStep: number;
  setCreateStep: (step: number) => void;
  newEvent: NewEvent;
  setNewEvent: (event: NewEvent | ((prev: NewEvent) => NewEvent)) => void;
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
  onCreateEvent 
}: CreateEventDialogProps) {
    const [eventType, setEventType] = useState<'Webinar' | 'Social' | null>(null);
    const [date, setDate] = useState<Date>();

    // Sync date with newEvent
    const handleDateChange = (selectedDate: Date | undefined) => {
        setDate(selectedDate);
        if (selectedDate) {
            setNewEvent(prev => ({...prev, date: selectedDate.toISOString().split('T')[0]}));
        }
    };

    const handleEventTypeSelect = (type: 'Webinar' | 'Social') => {
        setEventType(type);
        setNewEvent(prev => ({...prev, eventType: type === 'Webinar' ? EventType.WEBINAR : EventType.SOCIAL}));
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
        setNewEvent(prev => ({...prev, organizerId: userId || ""}));
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Event
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
                <form onSubmit={handleCreate}>
                    <DialogHeader>
                        <DialogTitle>Create New Event</DialogTitle>
                        <DialogDescription>Create a new event for members to participate in.</DialogDescription>
                    </DialogHeader>

                    {createStep === 1 && (
                        <div className="py-4">
                            <p className="text-sm text-muted-foreground mb-4">Step 1 of 2</p>
                            <h3 className="font-semibold mb-2">Choose Event Type</h3>
                            <p className="text-sm text-muted-foreground mb-4">Select the type of event you want to create.</p>
                            <div className="grid grid-cols-2 gap-4">
                                <Card
                                    className={cn("p-6 flex flex-col items-center justify-center cursor-pointer", eventType === 'Webinar' && 'border-primary ring-2 ring-primary')}
                                    onClick={() => handleEventTypeSelect('Webinar')}
                                >
                                    <Video className="h-8 w-8 mb-2 text-primary" />
                                    <p className="font-semibold">Webinar</p>
                                    <p className="text-xs text-muted-foreground text-center">Online educational sessions with Google Meet integration</p>
                                </Card>
                                <Card
                                    className={cn("p-6 flex flex-col items-center justify-center cursor-pointer", eventType === 'Social' && 'border-primary ring-2 ring-primary')}
                                    onClick={() => handleEventTypeSelect('Social')}
                                >
                                    <PartyPopper className="h-8 w-8 mb-2 text-primary" />
                                    <p className="font-semibold">Social Event</p>
                                    <p className="text-xs text-muted-foreground text-center">In-person gatherings and networking events</p>
                                </Card>
                            </div>
                        </div>
                    )}

                    {createStep === 2 && (
                        <div className="py-4 grid gap-4">
                            <p className="text-sm text-muted-foreground">Step 2 of 2</p>
                             <div className="space-y-2">
                                <Label htmlFor="event-name">Event Name</Label>
                                <Input id="event-name" value={newEvent.title || ''} onChange={(e) => setNewEvent(prev => ({...prev, title: e.target.value}))} required/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="event-description">Event Description</Label>
                                <Textarea id="event-description" value={newEvent.description || ''} onChange={(e) => setNewEvent(prev => ({...prev, description: e.target.value}))} required/>
                            </div>
                            <div className="space-y-2">
                                <Label>Event Image</Label>
                                <div className="flex items-center justify-center w-full">
                                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/50">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                            <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                                        </div>
                                        <input id="dropzone-file" type="file" className="hidden" />
                                    </label>
                                </div> 
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-2">
                                    <Label>Date</Label>
                                     <Popover>
                                        <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                            )}
                                        >
                                            {date ? format(date, "PPP") : <span>Pick a date</span>}
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
                                    <Label htmlFor="time">Time</Label>
                                    <Input id="time" type="time" required/>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Select onValueChange={(value) => setNewEvent(prev => ({...prev, location: value}))} required>
                                        <SelectTrigger><SelectValue placeholder="Select location"/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="online">Online</SelectItem>
                                            <SelectItem value="in-person">In-person</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="event-tag">Event Type</Label>
                                     <Select required>
                                        <SelectTrigger><SelectValue placeholder="Select type"/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="free">Free</SelectItem>
                                            <SelectItem value="premium">Premium</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label>Event Host</Label>
                                <UserSelect
                                    value={newEvent.organizerId}
                                    onChange={handleSelectOrganizer}
                                    placeholder="Select event organizer"
                                />
                            </div>
                            {eventType === 'Social' && (
                                <div className="space-y-2">
                                    <Label htmlFor="price">Price per Guest (EUR)</Label>
                                    <Input id="price" type="number" placeholder="e.g., 25" required/>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <DialogFooter>
                        {createStep === 1 && (
                             <>
                                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                                <Button type="button" onClick={handleNext} disabled={!eventType}>Next</Button>
                            </>
                        )}
                        {createStep === 2 && (
                            <>
                                <Button type="button" variant="outline" onClick={handleBack}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                                <Button type="submit" disabled={actionLoading.create}>
                                    {actionLoading.create ? "Creating..." : "Create Event"}
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
