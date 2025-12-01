"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Video } from "lucide-react";

interface Session {
  id: string;
  title: string;
  student: {
    name: string;
    avatar?: string;
  };
  scheduledTime: string;
  duration: number; // in minutes
  meetLink?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

interface UpcomingSessionsProps {
  sessions: Session[];
  loading?: boolean;
  onJoinSession?: (sessionId: string, meetLink?: string) => void;
  onRescheduleSession?: (sessionId: string) => void;
}

export function UpcomingSessions({ 
  sessions, 
  loading = false,
  onJoinSession,
  onRescheduleSession 
}: UpcomingSessionsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-gray-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
                <div className="h-8 w-20 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No upcoming sessions
            </p>
          ) : (
            sessions.map((session) => (
              <SessionItem 
                key={session.id} 
                session={session}
                onJoinSession={onJoinSession}
                onRescheduleSession={onRescheduleSession}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SessionItem({ 
  session, 
  onJoinSession,
  onRescheduleSession 
}: { 
  session: Session;
  onJoinSession?: (sessionId: string, meetLink?: string) => void;
  onRescheduleSession?: (sessionId: string) => void;
}) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const isSessionSoon = () => {
    const sessionTime = new Date(session.scheduledTime);
    const now = new Date();
    const diffInMinutes = (sessionTime.getTime() - now.getTime()) / (1000 * 60);
    return diffInMinutes <= 15 && diffInMinutes > 0;
  };

  return (
    <div className="flex items-center space-x-4 p-3 rounded-lg border">
      <Avatar>
        <AvatarImage src={session.student.avatar} />
        <AvatarFallback>
          {session.student.name.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <h4 className="text-sm font-medium">{session.title}</h4>
        <p className="text-sm text-muted-foreground">with {session.student.name}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(session.scheduledTime)}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(session.scheduledTime)} ({session.duration}min)
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {isSessionSoon() && session.meetLink && (
          <Button 
            size="sm" 
            onClick={() => onJoinSession?.(session.id, session.meetLink)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Video className="h-3 w-3 mr-1" />
            Join
          </Button>
        )}
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => onRescheduleSession?.(session.id)}
        >
          Reschedule
        </Button>
      </div>
    </div>
  );
}