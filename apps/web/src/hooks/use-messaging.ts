"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createAuthenticatedSocket } from "@/lib/socket";
import { getUserConversations } from "@/actions/messaging";
import { Conversation, FormattedMessage } from "@/types/messaging";

interface TypingUser {
  conversationId: string;
  userId: string;
  userName: string;
}

interface MessagingUser {
  id: string;
  name: string;
  avatar: string;
  token: string;
}

export function useMessaging(currentUser: MessagingUser, conversationId: string | null) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [currentMessages, setCurrentMessages] = useState<FormattedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState<any>(null); // Still using any for socket as it's complex, but let's try to type others
  const [typingUser, setTypingUser] = useState<TypingUser | null>(null);

  // Refs for typing indicator debouncing
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const loadConversations = useCallback(async () => {
    if (!currentUser.id) {
      setLoading(false);
      return;
    }

    try {
      const response = await getUserConversations(currentUser.id, 20);
      if (response.success) {
        setConversations(response.data || []);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser.id]);

  // Handle conversation updates from socket
  const handleConversationUpdate = useCallback((data: {
    conversationId: string;
    lastMessage: string;
    lastMessageTime: string | Date;
  }) => {
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
    (data: TypingUser & { isTyping: boolean }) => {
      if (data.userId === currentUser.id) return; // Ignore own typing

      if (data.isTyping) {
        setTypingUser({
          conversationId: data.conversationId,
          userId: data.userId,
          userName: data.userName,
        });
      } else {
        setTypingUser((prev) => (prev?.userId === data.userId ? null : prev));
      }
    },
    [currentUser.id]
  );

  // Sync selected conversation when ID changes
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const convo = conversations.find((c) => c.id === conversationId);
      if (convo) {
        if (convo.id !== selectedConversation?.id) {
          setCurrentMessages([]);
          setSelectedConversation(convo);
        }
      }
    } else if (!conversationId) {
      setSelectedConversation(null);
      setCurrentMessages([]);
    }
  }, [conversationId, conversations, selectedConversation?.id]);

  // Socket initialization and event listeners
  useEffect(() => {
    if (currentUser.token && currentUser.id) {
      const newSocket = createAuthenticatedSocket(currentUser.token);
      newSocket.connect();
      setSocket(newSocket);

      newSocket.on("connect", () => {
        loadConversations();
      });

      newSocket.on("messages_loaded", (data: { messages: any[] }) => {
        setCurrentMessages((data.messages || []).map(msg => ({
          ...msg,
          createdAt: new Date(msg.createdAt),
          updatedAt: msg.updatedAt ? new Date(msg.updatedAt) : undefined,
        })) as FormattedMessage[]);
      });

      newSocket.on("new_message", (message: any) => {
        setCurrentMessages((prev) => {
          // Remove any optimistic message with temp id
          const filtered = prev.filter(
            (m: any) => !m.id?.startsWith("temp-") || m.content !== message.content
          );

          const newMessage: FormattedMessage = {
            id: message.id,
            senderId: message.senderId,
            conversationId: message.conversationId,
            content: message.content,
            isMe: message.senderId === currentUser.id,
            type: message.type,
            isAi: message.isAi || false,
            isRead: false,
            createdAt: new Date(message.createdAt),
            updatedAt: new Date(message.createdAt),
            readAt: null,
            editedAt: null,
            isEdited: false,
            isDeleted: false
          };

          return [...filtered, newMessage];
        });
        // Clear typing indicator when message received
        setTypingUser(null);
      });

      newSocket.on("conversation_updated", handleConversationUpdate);
      newSocket.on("typing_indicator", handleTypingIndicator);
      newSocket.on("error", (error: { message: string }) => {
        console.error("Socket error:", error);
      });

      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    }
  }, [currentUser.token, currentUser.id, loadConversations, handleConversationUpdate, handleTypingIndicator]);

  // Join/Leave conversation rooms
  useEffect(() => {
    if (selectedConversation && socket?.connected) {
      socket.emit("join_conversation", selectedConversation.id);
      socket.emit("load_messages", { conversationId: selectedConversation.id });

      return () => {
        socket.emit("leave_conversation", selectedConversation.id);
      };
    }
  }, [selectedConversation, socket]);

  const handleTypingStart = useCallback(() => {
    if (!socket?.connected || !selectedConversation) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("typing_start", selectedConversation.id);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current && socket?.connected && selectedConversation) {
        isTypingRef.current = false;
        socket.emit("typing_stop", selectedConversation.id);
      }
    }, 2000);
  }, [socket, selectedConversation]);

  const handleSendMessage = async (messageText: string) => {
    if (!selectedConversation || sending || !socket?.connected) return;

    try {
      setSending(true);

      // Stop typing indicator
      if (isTypingRef.current) {
        isTypingRef.current = false;
        socket.emit("typing_stop", selectedConversation.id);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Optimistic update
      const optimisticMessage: FormattedMessage = {
        id: `temp-${Date.now()}`,
        senderId: currentUser.id,
        conversationId: selectedConversation.id,
        content: messageText,
        type: "TEXT",
        isMe: true,
        isAi: false,
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        readAt: null,
        editedAt: null,
        isEdited: false,
        isDeleted: false
      };

      setCurrentMessages((prev) => [...prev, optimisticMessage]);

      socket.emit("send_message", {
        conversationId: selectedConversation.id,
        content: messageText,
        type: "TEXT",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setCurrentMessages((prev) => prev.filter((m) => !m.id?.startsWith("temp-")));
    } finally {
      setSending(false);
    }
  };

  return {
    conversations,
    selectedConversation,
    currentMessages,
    loading,
    sending,
    typingUser,
    handleSendMessage,
    handleTypingStart,
    loadConversations
  };
}
