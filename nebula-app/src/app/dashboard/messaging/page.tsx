"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { createAuthenticatedSocket } from "@/lib/socket";
import {
  type Conversation,
  type Message,
} from "@/actions/messaging";
import { useAuth } from "@/hooks/use-auth";
import { getAccessToken } from "@/lib/auth-storage";

import { ConversationList } from "./components/conversation-list";
import { ChatHeader } from "./components/chat-header";
import { MessageList } from "./components/message-list";
import { MessageInput } from "./components/message-input";
import { EmptyState } from "./components/empty-state";

function MessagingPageContent() {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("conversationId");
  const { profile } = useAuth();

  // Get current user from auth
  const accessToken = getAccessToken();
  const currentUser = {
    id: profile?.id || "",
    name: profile?.fullName || "User",
    avatar: profile?.avatarUrl || "https://i.pravatar.cc/150?u=default",
    token: accessToken || "",
  };

  React.useEffect(() => {
    console.log("Current user state:", {
      id: currentUser.id,
      hasToken: !!currentUser.token,
      profileLoaded: !!profile,
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


  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const convo = conversations.find((c) => c.id === conversationId);
      if (convo) {
        setSelectedConversation(convo);
        loadMessages(convo.id);
      }
    }
  }, [conversationId, conversations]);

  useEffect(() => {
    if (currentUser.token && currentUser.id) {
      console.log("Creating authenticated socket connection");
      const newSocket = createAuthenticatedSocket(currentUser.token);
      newSocket.connect();
      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
        newSocket.emit("load_conversations");
      });

      newSocket.on("conversations_loaded", (conversations: any[]) => {
        console.log("📋 Conversations loaded via socket:", conversations);
        setConversations(conversations);
        setLoading(false);
      });

      newSocket.on("messages_loaded", (data: any) => {
        console.log("📨 Messages loaded via socket:", data);
        if (data.conversationId === selectedConversation?.id) {
          setCurrentMessages(data.messages);
        }
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
        console.error("Socket error:", error);
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
    if (selectedConversation && socket.connected) {
      socket.emit("join_conversation", selectedConversation.id);

      return () => {
        socket.emit("leave_conversation", selectedConversation.id);
      };
    }
  }, [selectedConversation]);


  const loadMessages = async (conversationId: string) => {
    if (!currentUser.id) {
      console.warn("No user ID available, skipping message load");
      return;
    }

    // Load messages only via socket
    if (socket && socket.connected) {
      console.log("Loading messages via socket for conversation:", conversationId);
      socket.emit("load_messages", { conversationId });
    } else {
      console.warn("Socket not connected, cannot load messages");
    }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    await loadMessages(conversation.id);

    // Join the conversation room for real-time updates
    if (socket && socket.connected) {
      console.log("Joining conversation room:", conversation.id);
      socket.emit("join_conversation", conversation.id);
    }
  };

  const handleSendMessage = async (messageText: string) => {
    if (!selectedConversation || sending) return;

    try {
      setSending(true);

      if (!socket || !socket.connected) {
        console.error("Socket not connected");
        return;
      }

      console.log("Sending message:", {
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
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="text-muted-foreground">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="grid md:grid-cols-4 flex-1">
        <ConversationList
          conversations={conversations}
          selectedConversation={selectedConversation}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onConversationSelect={handleSelectConversation}
        />

        <div
          className={cn(
            "md:col-span-3 flex flex-col h-full",
            !selectedConversation && "hidden md:flex"
          )}
        >
          {selectedConversation ? (
            <>
              <ChatHeader
                conversation={selectedConversation}
                onBack={() => setSelectedConversation(null)}
              />

              <MessageList
                messages={currentMessages}
                conversation={selectedConversation}
                currentUserId={currentUser.id}
              />

              <MessageInput
                onSendMessage={handleSendMessage}
                disabled={sending}
                placeholder="Type a message..."
              />
            </>
          ) : (
            <EmptyState message="Select a conversation to start messaging" />
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagingPage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <MessagingPageContent />
    </React.Suspense>
  );
}
