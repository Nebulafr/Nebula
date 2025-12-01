"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { type Message, type Conversation } from "@/actions/messaging";

interface MessageListProps {
  messages: Message[];
  conversation: Conversation;
  currentUserId: string;
  loading?: boolean;
}

export function MessageList({ 
  messages, 
  conversation, 
  currentUserId, 
  loading = false 
}: MessageListProps) {
  if (loading) {
    return (
      <ScrollArea className="flex-1">
        <div className="space-y-6 p-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={cn("flex items-end gap-3", i % 2 === 0 ? "justify-end" : "justify-start")}>
              {i % 2 !== 0 && <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />}
              <div className={cn("max-w-xs md:max-w-md p-3 rounded-2xl bg-gray-200 animate-pulse", i % 2 === 0 ? "h-16" : "h-12")} />
              {i % 2 === 0 && <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />}
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="space-y-6 p-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex items-end gap-3",
              msg.isMe ? "justify-end" : "justify-start"
            )}
          >
            {!msg.isMe && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={conversation.avatar || undefined} />
                <AvatarFallback>
                  {conversation.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
            <Card
              className={cn(
                "max-w-xs md:max-w-md p-3 rounded-2xl",
                msg.isMe
                  ? "bg-primary text-primary-foreground rounded-br-none"
                  : "bg-muted rounded-bl-none"
              )}
            >
              <p className="text-sm">{msg.text}</p>
              <p
                className={cn(
                  "text-xs mt-2",
                  msg.isMe
                    ? "text-primary-foreground/70 text-right"
                    : "text-muted-foreground/70 text-left"
                )}
              >
                {msg.timestamp}
              </p>
            </Card>
            {msg.isMe && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://i.pravatar.cc/150?u=${currentUserId}`} />
                <AvatarFallback>
                  U
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}