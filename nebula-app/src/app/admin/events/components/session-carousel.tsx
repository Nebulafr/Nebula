"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  XCircle,
} from "lucide-react";

interface SessionCarouselProps {
  sessions: Array<{
    date: string;
    time: string;
    price: string;
    currency: string;
    spotsLeft: string;
    description: string;
  }>;
  currentSessionIndex: number;
  onAddSession: () => void;
  onUpdateSession: (index: number, field: string, value: string) => void;
  onRemoveSession: (index: number) => void;
  onNavigateToSession: (index: number) => void;
  onGoToPreviousSession: () => void;
  onGoToNextSession: () => void;
}

export function SessionCarousel({
  sessions,
  currentSessionIndex,
  onAddSession,
  onUpdateSession,
  onRemoveSession,
  onNavigateToSession,
  onGoToPreviousSession,
  onGoToNextSession,
}: SessionCarouselProps) {
  return (
    <div className="grid gap-4 py-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Event Sessions</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddSession}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Session
        </Button>
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No sessions added yet. Click "Add Session" to create your first
          session.
        </div>
      )}

      {sessions.length > 0 && (
        <div className="space-y-4">
          {/* Session Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onGoToPreviousSession}
                disabled={currentSessionIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                Session {currentSessionIndex + 1} of {sessions.length}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onGoToNextSession}
                disabled={currentSessionIndex === sessions.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemoveSession(currentSessionIndex)}
            >
              <XCircle className="h-4 w-4" />
              Remove
            </Button>
          </div>

          {/* Current Session Form */}
          {sessions[currentSessionIndex] && (
            <div className="border rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="current-session-date">Date</Label>
                  <Input
                    id="current-session-date"
                    type="date"
                    value={sessions[currentSessionIndex].date}
                    onChange={(e) =>
                      onUpdateSession(currentSessionIndex, "date", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="current-session-time">Time</Label>
                  <Input
                    id="current-session-time"
                    type="time"
                    value={sessions[currentSessionIndex].time}
                    onChange={(e) =>
                      onUpdateSession(currentSessionIndex, "time", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="current-session-price">Price</Label>
                  <Input
                    id="current-session-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={sessions[currentSessionIndex].price}
                    onChange={(e) =>
                      onUpdateSession(currentSessionIndex, "price", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="current-session-currency">Currency</Label>
                  <Select
                    value={sessions[currentSessionIndex].currency}
                    onValueChange={(value) =>
                      onUpdateSession(currentSessionIndex, "currency", value)
                    }
                  >
                    <SelectTrigger id="current-session-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="current-session-spots">Available Spots</Label>
                  <Input
                    id="current-session-spots"
                    type="number"
                    min="1"
                    value={sessions[currentSessionIndex].spotsLeft}
                    onChange={(e) =>
                      onUpdateSession(currentSessionIndex, "spotsLeft", e.target.value)
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="current-session-description">Session Description</Label>
                <Textarea
                  id="current-session-description"
                  value={sessions[currentSessionIndex].description}
                  onChange={(e) =>
                    onUpdateSession(currentSessionIndex, "description", e.target.value)
                  }
                  placeholder="Describe what this session includes..."
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Session Indicators */}
          {sessions.length > 1 && (
            <div className="flex justify-center gap-1">
              {sessions.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentSessionIndex
                      ? "bg-primary"
                      : "bg-muted-foreground/30"
                  }`}
                  onClick={() => onNavigateToSession(index)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}