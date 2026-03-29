 
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
import { useTranslations } from "next-intl";

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
  const t = useTranslations("dashboard.admin");

  const getStatusLabel = (status: string) => {
    if (status === "UPCOMING") return t("upcoming");
    if (status === "COMPLETED") return t("completed");
    if (status === "CANCELLED") return t("cancelled");
    if (status === "PENDING") return t("statusPendingApproval") || "Pending";
    return status;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("event")}</TableHead>
          <TableHead>{t("eventType")}</TableHead>
          <TableHead>{t("organizer")}</TableHead>
          <TableHead>{t("date")}</TableHead>
          <TableHead>{t("status")}</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8">
              <div className="space-y-2">
                <p className="text-muted-foreground">{t("noEventsFound")}</p>
                <p className="text-sm text-muted-foreground">{t("createFirstEvent")}</p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          events.map((event) => (
          <TableRow key={event.id}>
            <TableCell className="font-medium">{event.title}</TableCell>
            <TableCell>
              <Badge
                variant={
                  event.eventType === "WEBINAR" ? "default" : "secondary"
                }
              >
                {event.eventType === "WEBINAR" ? t("webinar") : event.eventType === "SOCIAL" ? t("socialEvent") : event.eventType}
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
                <span>{event.organizer?.fullName || t("statusUnknown")}</span>
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
                {getStatusLabel(event.status)}
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
                    {t("viewDetails")}
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
                        {t("approve")}
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
                        {t("reject")}
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
                      {t("cancel")}
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
                    {t("delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        )))}
      </TableBody>
    </Table>
  );
}