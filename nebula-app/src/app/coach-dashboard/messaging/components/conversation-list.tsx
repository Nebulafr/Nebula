"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  formatUserName,
  getUserInitials,
  formatChatTime,
  formatMessagePreview,
  formatUnreadCount,
} from "@/lib/chat-utils";
import { Conversation } from "@/generated/prisma";
import { useTranslations } from "next-intl";

interface ConversationListProps {
  conversations: any[];
  selectedConversation: Conversation | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onConversationSelect: (conversation: any) => void;
  loading?: boolean;
}

export function ConversationList({
  conversations,
  selectedConversation,
  searchTerm,
  onConversationSelect,
  onSearchChange,
  loading = false,
}: ConversationListProps) {
  const t = useTranslations("dashboard.coach.messaging");
  const filteredConversations = conversations.filter(
    (convo) =>
      convo.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      convo.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t("searchHint")}
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 shadow-sm"
              disabled
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
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
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t("searchHint")}
            value={searchTerm || ""}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 shadow-sm focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? t("noConversationsFound") : t("noConversations")}
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
  conversation: any;
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
  const messagePreview = formatMessagePreview(conversation.lastMessage, 20);
  const unreadDisplay = formatUnreadCount(conversation.unread);

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
        <Avatar className="h-12 w-12 border-2 border-gray-100">
          <AvatarImage src={conversation.avatar} />
          <AvatarFallback className="font-medium text-gray-600 bg-gray-100">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-bold text-sm text-gray-900 truncate">
              {displayName}
            </h3>
            <div className="flex items-center gap-2 ml-2">
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {timeDisplay}
              </span>
              {unreadDisplay && (
                <Badge className="h-5 w-5 p-0 bg-primary text-white text-xs rounded-full flex items-center justify-center min-w-[20px]">
                  {unreadDisplay}
                </Badge>
              )}
            </div>
          </div>

          <p className="text-sm text-muted-foreground truncate leading-relaxed">
            {messagePreview}
          </p>
        </div>
      </div>
    </button>
  );
}
