"use client";

import React, { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import { Message } from "@/types/messaging";
import { useAuth } from "@/hooks/use-auth";

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const { profile } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1 p-6" ref={scrollRef}>
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        {messages.map((message) => {
          const isMe = message.senderId === profile?.id;
          
          return (
            <div
              key={message.id}
              className={cn(
                "flex items-end gap-3 max-w-[80%]",
                isMe ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              {!isMe && (
                <Avatar className="h-8 w-8 mb-1 flex-shrink-0">
                  <AvatarFallback className="text-xs bg-muted">
                    {getInitials("U")}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className="flex flex-col gap-1">
                <div
                  className={cn(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                    isMe
                      ? "bg-primary text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                  )}
                >
                  {message.content}
                </div>
                <div
                  className={cn(
                    "flex items-center gap-2 px-1",
                    isMe ? "justify-end" : "justify-start"
                  )}
                >
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
