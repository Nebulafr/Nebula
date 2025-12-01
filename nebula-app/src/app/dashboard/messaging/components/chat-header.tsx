"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { type Conversation } from "@/actions/messaging";

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
  return (
    <div className="flex items-center gap-4 border-b p-4">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onBack}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <Avatar>
        <AvatarImage src={conversation.avatar} />
        <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <h4 className="font-semibold">{conversation.name}</h4>
        <p className="text-xs text-muted-foreground">{conversation.role}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="ml-auto"
        onClick={onMoreOptions}
      >
        <MoreVertical className="h-5 w-5" />
      </Button>
    </div>
  );
}
