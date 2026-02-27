/* eslint-disable */
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createAuthenticatedSocket } from "@/lib/socket";
import { useAuth } from "@/hooks/use-auth";
import { getAccessToken } from "@/lib/auth-storage";
import { getUserConversations } from "@/actions/messaging";

import { ConversationList } from "./components/conversation-list";
import { ChatHeader } from "./components/chat-header";
import { MessageList } from "./components/message-list";
import { MessageInput } from "./components/message-input";
import { EmptyState } from "./components/empty-state";
import { TypingIndicator } from "./components/typing-indicator";
import { Conversation, Message } from "@/generated/prisma";

interface TypingUser {
  conversationId: string;
  userId: string;
  userName: string;
}

function StudentMessagingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationId = searchParams.get("conversationId");
  const { profile } = useAuth();

  const accessToken = getAccessToken();
  const currentUser = {
    id: profile?.id || "",
    name: profile?.fullName || "Student",
    avatar: profile?.avatarUrl || "https://i.pravatar.cc/150?u=student",
    token: accessToken || "",
  };

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState<any>(null);
  const [typingUser, setTypingUser] = useState<TypingUser | null>(null);

  // Refs for typing indicator debouncing
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const loadConversations = async () => {
    try {
      const response = await getUserConversations(currentUser.id, 10);
      if (response.success) {
        setConversations(response.data || []);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
      setLoading(false);
    }
  };

  // Handle conversation updates from socket
  const handleConversationUpdate = useCallback((data: any) => {
    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.id === data.conversationId
          ? {
            ...c,
            lastMessage: data.lastMessage,
            lastMessageTime: new Date(data.lastMessageTime),
          }
          : c
      );
      // Sort by most recent message
      return updated.sort(
        (a, b) =>
          new Date(b.lastMessageTime || 0).getTime() -
          new Date(a.lastMessageTime || 0).getTime()
      );
    });
  }, []);

  // Handle typing indicator
  const handleTypingIndicator = useCallback(
    (data: any) => {
      if (data.userId === currentUser.id) return; // Ignore own typing

      if (data.isTyping) {
        setTypingUser({
          conversationId: data.conversationId,
          userId: data.userId,
          userName: data.userName,
        });
      } else if (typingUser?.userId === data.userId) {
        setTypingUser(null);
      }
    },
    [currentUser.id, typingUser?.userId]
  );

  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const convo = conversations.find((c) => c.id === conversationId);
      if (convo && convo.id !== selectedConversation?.id) {
        setCurrentMessages([]);
        setSelectedConversation(convo);

        if (socket?.connected) {
          socket.emit("join_conversation", convo.id);
          socket.emit("load_messages", { conversationId: convo.id });
        }
      }
    } else if (!conversationId) {
      setSelectedConversation(null);
      setCurrentMessages([]);
    }
  }, [conversationId, conversations]);

  useEffect(() => {
    if (currentUser.token && currentUser.id) {
      const newSocket = createAuthenticatedSocket(currentUser.token);
      newSocket.connect();
      setSocket(newSocket);

      newSocket.on("connect", () => {
        loadConversations();
      });
      newSocket.on("messages_loaded", (data: any) => {
        setCurrentMessages(data.messages || []);
      });
      newSocket.on("new_message", (message: any) => {
        setCurrentMessages((prev) => {
          // Remove any optimistic message with temp id and add the real one
          const filtered = prev.filter(
            (m: any) => !m.id?.startsWith("temp-") || m.text !== message.content
          );
          return [
            ...filtered,
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
            } as any,
          ];
        });
        // Clear typing indicator when message received
        setTypingUser(null);
      });

      newSocket.on("conversation_updated", handleConversationUpdate);
      newSocket.on("typing_indicator", handleTypingIndicator);
      newSocket.on("error", (error: any) => {
        console.error("Student socket error:", error);
        if (error?.message === "Authentication required") {
          console.log("Socket auth failed - user may need to re-login");
        }
      });

      return () => {
        newSocket.off("connect");
        newSocket.off("messages_loaded");
        newSocket.off("new_message");
        newSocket.off("conversation_updated");
        newSocket.off("typing_indicator");
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
  }, [selectedConversation, socket]);

  const handleSelectConversation = async (conversation: Conversation) => {
    router.push(`/dashboard/messaging?conversationId=${conversation?.id}`);
  };

  // Emit typing indicator with debounce
  const handleTypingStart = useCallback(() => {
    if (!socket?.connected || !selectedConversation) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("typing_start", selectedConversation.id);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator after 2 seconds of no input
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current && socket?.connected && selectedConversation) {
        isTypingRef.current = false;
        socket.emit("typing_stop", selectedConversation.id);
      }
    }, 2000);
  }, [socket, selectedConversation]);

  const handleSendMessage = async (messageText: string) => {
    if (!selectedConversation || sending) return;

    try {
      setSending(true);

      // Stop typing indicator
      if (isTypingRef.current && socket?.connected) {
        isTypingRef.current = false;
        socket.emit("typing_stop", selectedConversation.id);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (!socket || !socket.connected) {
        console.error("Socket not connected");
        return;
      }

      // Optimistic update - add message immediately
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        sender: currentUser.name,
        text: messageText,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isMe: true,
        type: "TEXT",
        isRead: false,
        isEdited: false,
        pending: true,
      };
      setCurrentMessages((prev) => [...prev, optimisticMessage as any]);

      // Send via socket - no need to reload conversations anymore
      socket.emit("send_message", {
        conversationId: selectedConversation.id,
        content: messageText,
        type: "TEXT",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove the optimistic message on error
      setCurrentMessages((prev) =>
        prev.filter((m: any) => !m.id?.startsWith("temp-"))
      );
    } finally {
      setSending(false);
    }
  };

  if (loading) {
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
        selectedConversation={selectedConversation}
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
              onBack={() => setSelectedConversation(null)}
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
