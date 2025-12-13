"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

interface EventsTableProps {
  events: any[];
  actionLoading: Record<string, boolean>;
  onViewDetails: (event: any) => void;
  onEventAction: (id: string, status: string) => void;
  onDeleteEvent: (id: string) => void;
}

export function EventsTable({
  events,
  actionLoading,
  onViewDetails,
  onEventAction,
  onDeleteEvent,
}: EventsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Event</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Organizer</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => (
          <TableRow key={event.id}>
            <TableCell className="font-medium">{event.title}</TableCell>
            <TableCell>
              <Badge
                variant={
                  event.eventType === "WEBINAR" ? "default" : "secondary"
                }
              >
                {event.eventType}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={event.organizer?.avatarUrl} />
                  <AvatarFallback>
                    {event.organizer?.fullName?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>
                <span>{event.organizer?.fullName || "Unknown"}</span>
              </div>
            </TableCell>
            <TableCell>
              {new Date(event.date).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  event.status === "UPCOMING"
                    ? "default"
                    : event.status === "COMPLETED"
                    ? "outline"
                    : event.status === "CANCELLED"
                    ? "destructive"
                    : "secondary"
                }
              >
                {event.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onViewDetails(event)}>
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {event.status === "PENDING" && (
                    <>
                      <DropdownMenuItem
                        onClick={() => onEventAction(event.id, "UPCOMING")}
                        disabled={actionLoading[event.id]}
                      >
                        {actionLoading[event.id] ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="mr-2 h-4 w-4" />
                        )}
                        Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onEventAction(event.id, "CANCELLED")}
                        disabled={actionLoading[event.id]}
                      >
                        {actionLoading[event.id] ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="mr-2 h-4 w-4" />
                        )}
                        Reject
                      </DropdownMenuItem>
                    </>
                  )}
                  {event.status === "UPCOMING" && (
                    <DropdownMenuItem
                      onClick={() => onEventAction(event.id, "CANCELLED")}
                      disabled={actionLoading[event.id]}
                    >
                      {actionLoading[event.id] ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="mr-2 h-4 w-4" />
                      )}
                      Cancel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onDeleteEvent(event.id)}
                    disabled={actionLoading[`delete-${event.id}`]}
                  >
                    {actionLoading[`delete-${event.id}`] ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}