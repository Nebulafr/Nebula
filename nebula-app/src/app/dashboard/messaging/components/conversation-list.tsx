"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { type Conversation } from "@/actions/messaging";

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onConversationSelect: (conversation: Conversation) => void;
  loading?: boolean;
}

export function ConversationList({
  conversations,
  selectedConversation,
  searchTerm,
  onSearchChange,
  onConversationSelect,
  loading = false,
}: ConversationListProps) {
  const filteredConversations = conversations.filter(
    (convo) =>
      convo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      convo.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={cn("flex flex-col border-r", selectedConversation && "hidden md:flex")}>
        <div className="border-b p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search" className="pl-10" disabled />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-4 p-4">
              <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
              <div className="flex-1 min-w-0">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col border-r", selectedConversation && "hidden md:flex")}>
      <div className="border-b p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="pl-10"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <p>No conversations found</p>
          </div>
        ) : (
          filteredConversations.map((convo) => (
            <div
              key={convo.id}
              className={cn(
                "flex cursor-pointer items-start gap-4 p-4 hover:bg-muted/50",
                selectedConversation?.id === convo.id && "bg-muted"
              )}
              onClick={() => onConversationSelect(convo)}
            >
              <Avatar>
                <AvatarImage src={convo.avatar || undefined} />
                <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="truncate font-semibold">{convo.name}</h4>
                  <p className="text-xs text-muted-foreground flex-shrink-0">
                    {convo.time}
                  </p>
                </div>
                <div className="flex items-start justify-between">
                  <p className="truncate text-sm text-muted-foreground">
                    {convo.lastMessage}
                  </p>
                  {convo.unread > 0 && (
                    <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground flex-shrink-0">
                      {convo.unread}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </ScrollArea>
    </div>
  );
}