"use client";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type Message } from "@/actions/messaging";

interface MessageListProps {
  messages: Message[];
  currentUserId?: string;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  return (
    <ScrollArea className="h-full w-full">
      <div className="space-y-6 p-6">
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id || index}
            message={message}
            isOwnMessage={message.isMe}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "flex items-end gap-3",
        isOwnMessage ? "justify-end" : "justify-start"
      )}
    >
      {/* Avatar for other messages (left side) */}
      {!isOwnMessage && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600">
              {message.sender?.charAt(0) || "U"}
            </span>
          </div>
        </div>
      )}

      {/* Message Content */}
      <div
        className={cn(
          "flex flex-col",
          isOwnMessage ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "max-w-xs md:max-w-md px-4 py-3 rounded-2xl shadow-sm",
            isOwnMessage
              ? "bg-primary text-white rounded-br-md"
              : "bg-muted text-gray-900 rounded-bl-md"
          )}
        >
          <p className="text-sm leading-relaxed">{message.text}</p>
        </div>

        {/* Timestamp */}
        <p
          className={cn(
            "mt-1 text-xs text-muted-foreground",
            isOwnMessage ? "text-right" : "text-left"
          )}
        >
          {message.timestamp}
        </p>
      </div>

      {/* Avatar for own messages (right side) */}
      {isOwnMessage && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-xs font-medium text-primary">M</span>
          </div>
        </div>
      )}
    </div>
  );
}
