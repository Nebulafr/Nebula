"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Info, MoreVertical, Phone, Video } from "lucide-react";
import { formatUserName, getInitials } from "@/lib/utils";
import { Conversation } from "@/types/messaging";

interface ChatHeaderProps {
  conversation: Conversation;
  onBack?: () => void;
}

export function ChatHeader({ conversation, onBack }: ChatHeaderProps) {
  const displayName = formatUserName(conversation.name);
  const initials = getInitials(conversation.name);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-4">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onBack}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}
        <div className="relative">
          <Avatar className="h-10 w-10 ring-2 ring-gray-50">
            <AvatarImage src={conversation.avatar ?? undefined} />
            <AvatarFallback name={conversation.name || undefined}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900 leading-tight">
            {displayName}
          </h2>
          <p className="text-xs text-green-600 font-medium">Online</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary hover:bg-primary/5 transition-colors">
          <Phone className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary hover:bg-primary/5 transition-colors">
          <Video className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary hover:bg-primary/5 transition-colors">
          <Info className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary hover:bg-primary/5 transition-colors">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
