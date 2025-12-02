"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { type Conversation } from "@/actions/messaging";
import { formatChatHeader } from "@/lib/chat-utils";

interface ChatHeaderProps {
  conversation: Conversation;
  onBack?: () => void;
  onMoreOptions?: () => void;
}

export function ChatHeader({
  conversation,
  onBack,
  onMoreOptions,
}: ChatHeaderProps) {
  const headerInfo = formatChatHeader(conversation);

  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white p-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarImage src={conversation.avatar} />
          <AvatarFallback className="bg-gray-100 text-gray-600 font-medium">
            {headerInfo.initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold text-lg text-gray-900">{headerInfo.displayName}</h2>
          <p className="text-sm text-gray-500 font-medium">{headerInfo.displayRole}</p>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={onMoreOptions} className="hover:bg-gray-100 rounded-full p-2">
        <MoreVertical className="h-5 w-5 text-gray-400" />
      </Button>
    </div>
  );
}
