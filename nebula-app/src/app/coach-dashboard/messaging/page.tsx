"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createAuthenticatedSocket } from "@/lib/socket";
import { type Conversation, type Message } from "@/actions/messaging";
import { useAuth } from "@/hooks/use-auth";
import { getAccessToken } from "@/lib/auth-storage";

import { ConversationList } from "./components/conversation-list";
import { ChatHeader } from "./components/chat-header";
import { MessageList } from "./components/message-list";
import { MessageInput } from "./components/message-input";
import { EmptyState } from "./components/empty-state";

function CoachMessagingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationId = searchParams.get("conversationId");
  const { profile } = useAuth();

  // Get current user from auth
  const accessToken = getAccessToken();
  const currentUser = {
    id: profile?.id || "",
    name: profile?.fullName || "Coach",
    avatar: profile?.avatarUrl || "https://i.pravatar.cc/150?u=coach",
    token: accessToken || "",
  };

  // Debug current user state
  React.useEffect(() => {
    console.log("Coach user state:", {
      id: currentUser.id,
      hasToken: !!currentUser.token,
      profileLoaded: !!profile,
      role: profile?.role,
    });
  }, [currentUser.id, currentUser.token, profile]);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState<any>(null);

  console.log({ currentMessages, selectedConversation });

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const convo = conversations.find((c) => c.id === conversationId);
      if (convo && convo.id !== selectedConversation?.id) {
        // Clear current messages first to avoid showing stale data
        setCurrentMessages([]);
        setSelectedConversation(convo);

        // Join the conversation room and load messages
        if (socket && socket.connected) {
          console.log("Coach joining conversation room:", convo.id);
          socket.emit("join_conversation", convo.id);
          socket.emit("load_messages", { conversationId: convo.id });
        }
      }
    } else if (!conversationId) {
      // Clear selection if no conversationId in URL
      setSelectedConversation(null);
      setCurrentMessages([]);
    }
  }, [conversationId, conversations]);

  useEffect(() => {
    if (currentUser.token && currentUser.id) {
      console.log("Creating authenticated socket connection for coach");
      const newSocket = createAuthenticatedSocket(currentUser.token);
      newSocket.connect();
      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("Coach socket connected:", newSocket.id);
        newSocket.emit("load_conversations");
      });

      newSocket.on("conversations_loaded", (conversations: any[]) => {
        console.log("📋 Coach conversations loaded via socket:", conversations);
        setConversations(conversations);
        setLoading(false);

        // Auto-select first conversation if no conversationId in URL
        if (!conversationId && conversations.length > 0) {
          const firstConversation = conversations[0];
          router.replace(
            `/coach-dashboard/messaging?conversationId=${firstConversation.id}`
          );
        }
      });

      newSocket.on("messages_loaded", (data: any) => {
        console.log("📨 Coach messages loaded via socket:", data);
        console.log("Current selectedConversation:", selectedConversation?.id);
        console.log("Data conversationId:", data.conversationId);

        setCurrentMessages(data.messages || []);
      });

      newSocket.on("new_message", (message: any) => {
        setCurrentMessages((prev) => [
          ...prev,
          {
            id: message.id,
            sender: message.sender.fullName || "Unknown",
            text: message.content,
            timestamp: new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            isMe: message.senderId === currentUser.id,
            type: message.type,
            isRead: false,
            isEdited: false,
          },
        ]);
      });

      newSocket.on("error", (error: any) => {
        console.error("Coach socket error:", error);
      });

      return () => {
        newSocket.off("connect");
        newSocket.off("conversations_loaded");
        newSocket.off("messages_loaded");
        newSocket.off("new_message");
        newSocket.off("error");
        newSocket.disconnect();
        setSocket(null);
      };
    }
  }, [currentUser.token, currentUser.id]);

  useEffect(() => {
    if (selectedConversation && socket?.connected) {
      socket.emit("join_conversation", selectedConversation.id);

      return () => {
        socket.emit("leave_conversation", selectedConversation.id);
      };
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    if (!currentUser.id) {
      console.warn("No coach ID available, skipping conversation load");
      setLoading(false);
      return;
    }

    // Load conversations only via socket
    if (socket && socket.connected) {
      console.log("Coach loading conversations via socket");
      socket.emit("load_conversations");
    } else {
      console.warn("Socket not connected, cannot load conversations");
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    if (!currentUser.id) {
      console.warn("No coach ID available, skipping message load");
      return;
    }

    // Load messages only via socket
    if (socket && socket.connected) {
      console.log(
        "Coach loading messages via socket for conversation:",
        conversationId
      );
      socket.emit("load_messages", { conversationId });
    } else {
      console.warn("Socket not connected, cannot load messages");
    }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    // Update URL to reflect selected conversation
    router.push(`/coach-dashboard/messaging?conversationId=${conversation.id}`);
  };

  const handleSendMessage = async (messageText: string) => {
    if (!selectedConversation || sending) return;

    try {
      setSending(true);

      if (!socket || !socket.connected) {
        console.error("Socket not connected");
        return;
      }

      console.log("Coach sending message:", {
        conversationId: selectedConversation.id,
        content: messageText,
        type: "TEXT",
      });

      // Join conversation room if not already joined
      socket.emit("join_conversation", selectedConversation.id);

      socket.emit("send_message", {
        conversationId: selectedConversation.id,
        content: messageText,
        type: "TEXT",
      });
      socket.emit("load_messages", { conversationId: selectedConversation.id });
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] max-h-screen bg-gray-50">
      <ConversationList
        conversations={conversations}
        selectedConversation={selectedConversation}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onConversationSelect={handleSelectConversation}
        loading={loading}
      />

      <div className="flex flex-1 flex-col min-h-0">
        {selectedConversation ? (
          <>
            <ChatHeader conversation={selectedConversation} />
            <div className="flex-1 min-h-0 overflow-hidden">
              <MessageList
                messages={currentMessages}
                currentUserId={currentUser.id}
              />
            </div>
            <div className="flex-shrink-0">
              <MessageInput
                onSendMessage={handleSendMessage}
                disabled={sending}
                placeholder="Type a message to your student..."
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
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="text-lg">Loading coach messaging...</div>
        </div>
      }
    >
      <CoachMessagingPageContent />
    </Suspense>
  );
}
