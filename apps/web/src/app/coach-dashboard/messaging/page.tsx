"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Loading } from "@/components/shared/loading";
import { getAccessToken } from "@/lib/auth";
import { useMessaging } from "@/hooks/use-messaging";
import { useTranslations } from "next-intl";

import { ConversationList } from "@/components/messaging/conversation-list";
import { ChatHeader } from "@/components/messaging/chat-header";
import { MessageList } from "@/components/messaging/message-list";
import { MessageInput } from "@/components/messaging/message-input";
import { EmptyState } from "@/components/messaging/empty-state";
import { TypingIndicator } from "@/components/messaging/typing-indicator";

function CoachMessagingPageContent() {
  const t = useTranslations("dashboard.coach.messaging");
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationId = searchParams.get("conversationId");
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const accessToken = getAccessToken();
  const currentUser = {
    id: profile?.id || "",
    name: profile?.fullName || "Coach",
    avatar: profile?.avatarUrl || "https://i.pravatar.cc/150?u=coach",
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
    router.push(`/coach-dashboard/messaging?conversationId=${conversation?.id}`);
  };

  if (loading && conversations.length === 0) {
    return <Loading fullPage message={t("loading")} />;
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
        searchPlaceholder={t("searchHint")}
        noConversationsMessage={t("noConversations")}
      />

      <div className="flex flex-1 flex-col min-h-0">
        {selectedConversation ? (
          <>
            <ChatHeader
              conversation={selectedConversation}
              onBack={() => router.push("/coach-dashboard/messaging")}
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
                placeholder={t("placeholder")}
              />
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

export default function CoachMessagingPage() {
  const t = useTranslations("dashboard.coach.messaging");
  return (
    <Suspense
      fallback={<Loading fullPage message={t("loading")} />}
    >
      <CoachMessagingPageContent />
    </Suspense>
  );
}
