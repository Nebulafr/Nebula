"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { getAccessToken } from "@/lib/auth-storage";
import { useMessaging } from "@/hooks/use-messaging";

import { ConversationList } from "@/components/messaging/conversation-list";
import { ChatHeader } from "@/components/messaging/chat-header";
import { MessageList } from "@/components/messaging/message-list";
import { MessageInput } from "@/components/messaging/message-input";
import { EmptyState } from "@/components/messaging/empty-state";
import { TypingIndicator } from "@/components/messaging/typing-indicator";

function StudentMessagingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationId = searchParams.get("conversationId");
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const accessToken = getAccessToken();
  const currentUser = {
    id: profile?.id || "",
    name: profile?.fullName || "Student",
    avatar: profile?.avatarUrl || "https://i.pravatar.cc/150?u=student",
    token: accessToken || "",
  };

  const {
    conversations,
    selectedConversation,
    currentMessages,
    loading,
    sending,
    typingUser,
    handleSendMessage,
    handleTypingStart,
  } = useMessaging(currentUser, conversationId);

  const handleSelectConversation = (conversation: any) => {
    router.push(`/dashboard/messaging?conversationId=${conversation?.id}`);
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading conversations...</div>
      </div>
    );
  }

  const showTypingIndicator =
    typingUser && typingUser.conversationId === selectedConversation?.id;

  return (
    <div className="flex h-full bg-gray-50 overflow-hidden">
      <ConversationList
        conversations={conversations}
        selectedConversationId={selectedConversation?.id}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onConversationSelect={handleSelectConversation}
        loading={loading}
      />

      <div className="flex flex-1 flex-col min-h-0">
        {selectedConversation ? (
          <>
            <ChatHeader
              conversation={selectedConversation}
              onBack={() => router.push("/dashboard/messaging")}
            />
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              <MessageList messages={currentMessages} />
            </div>
            {showTypingIndicator && (
              <TypingIndicator userName={typingUser.userName} />
            )}
            <div className="flex-shrink-0">
              <MessageInput
                onSendMessage={handleSendMessage}
                onTyping={handleTypingStart}
                disabled={sending}
                placeholder="Type a message to your coach..."
              />
            </div>
          </>
        ) : (
          <EmptyState message="Select a conversation to start messaging" />
        )}
      </div>
    </div>
  );
}

export default function MessagingPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="text-lg">Loading student messaging...</div>
        </div>
      }
    >
      <StudentMessagingPageContent />
    </React.Suspense>
  );
}
