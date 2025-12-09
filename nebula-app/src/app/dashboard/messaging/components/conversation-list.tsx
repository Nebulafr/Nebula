"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { type Conversation } from "@/actions/messaging";
import {
  formatUserName,
  getUserInitials,
  formatChatTime,
  formatMessagePreview,
  formatUnreadCount,
} from "@/lib/chat-utils";
import { useEffect } from "react";

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onConversationSelect: (conversation: Conversation) => void;
  loading?: boolean;
}

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

function ConversationItem({
  conversation,
  isSelected,
  onClick,
}: ConversationItemProps) {
  const displayName = formatUserName(conversation.name);
  const initials = getUserInitials(conversation.name);
  const timeDisplay = formatChatTime(conversation.time);
  const messagePreview = formatMessagePreview(conversation.lastMessage);
  const unreadDisplay = formatUnreadCount(conversation.unread);

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200",
        "hover:bg-muted/10",
        isSelected && "bg-muted"
      )}
      onClick={onClick}
    >
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
          {conversation.avatar ? (
            <img
              src={conversation.avatar}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-medium text-gray-600">
              {initials}
            </span>
          )}
        </div>
        {unreadDisplay && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-medium">
              {unreadDisplay}
            </span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-900 truncate">
            {displayName}
          </h3>
          <span className="text-xs text-gray-500 flex-shrink-0">
            {timeDisplay}
          </span>
        </div>
        <p className="text-sm text-gray-600 truncate">{messagePreview}</p>
      </div>
    </div>
  );
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

  useEffect(() => {
    onConversationSelect(selectedConversation!);
  }, [selectedConversation]);

  if (loading) {
    return (
      <div className="w-80 bg-white border-r border-gray-200">
        {/* Search Bar */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search conversations..."
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 shadow-sm"
              disabled
            />
          </div>
        </div>

        {/* Loading skeleton */}
        <ScrollArea className="h-[calc(100vh-5rem)]">
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200">
      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm || ""}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 shadow-sm focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="h-[calc(100vh-5rem)]">
        <div className="p-4 space-y-4">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? "No conversations found" : "No conversations yet"}
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedConversation?.id === conversation.id}
                onClick={() => onConversationSelect(conversation)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
