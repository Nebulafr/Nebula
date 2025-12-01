"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type Conversation } from "@/actions/messaging";

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
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
      convo.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      convo.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="w-80 bg-white border-r border-gray-200">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 shadow-sm"
              disabled
            />
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-5rem)]">
          <div className="space-y-4 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 min-w-0">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-3 w-8 bg-gray-200 rounded animate-pulse" />
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
            value={searchTerm}
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

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

function ConversationItem({ conversation, isSelected, onClick }: ConversationItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full p-4 rounded-lg text-left transition-all duration-200 
        hover:bg-muted/10 active:scale-[0.98]
        ${isSelected ? "bg-muted shadow-sm" : ""}
      `}
    >
      <div className="flex items-center gap-3">
        {/* Rounded Avatar */}
        <Avatar className="h-12 w-12 border-2 border-gray-100">
          <AvatarImage src={conversation.avatar} />
          <AvatarFallback className="font-medium text-gray-600 bg-gray-100">
            {conversation.name?.charAt(0)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Name and Timestamp Row */}
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-bold text-sm text-gray-900 truncate">
              {conversation.name}
            </h3>
            <div className="flex items-center gap-2 ml-2">
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {conversation.time}
              </span>
              {conversation.unread > 0 && (
                <Badge className="h-5 w-5 p-0 bg-primary text-white text-xs rounded-full flex items-center justify-center min-w-[20px]">
                  {conversation.unread > 99 ? "99+" : conversation.unread}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Last Message */}
          <p className="text-sm text-muted-foreground truncate leading-relaxed">
            {conversation.lastMessage}
          </p>
        </div>
      </div>
    </button>
  );
}