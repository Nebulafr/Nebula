"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Send, MoreVertical, Paperclip } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createAuthenticatedSocket } from "@/lib/socket";
import {
  getUserConversations,
  getConversationMessages,
  type Conversation,
  type Message,
} from "@/actions/messaging";
import { useAuth } from "@/hooks/use-auth";
import { getAccessToken } from "@/lib/auth-storage";

function CoachMessagingPageContent() {
  const searchParams = useSearchParams();
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
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    loadConversations();
  }, []);

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
      console.log("Creating authenticated socket connection for coach");
      const newSocket = createAuthenticatedSocket(currentUser.token);
      newSocket.connect();
      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("Coach socket connected:", newSocket.id);
      });

      newSocket.on("conversations_loaded", (conversations: any[]) => {
        console.log("📋 Coach conversations loaded via socket:", conversations);
        setConversations(conversations);
        setLoading(false);
      });

      newSocket.on("messages_loaded", (data: any) => {
        console.log("📨 Coach messages loaded via socket:", data);
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
  }, [selectedConversation, socket]);

  const loadConversations = async () => {
    if (!currentUser.id) {
      console.warn("No coach ID available, skipping conversation load");
      setLoading(false);
      return;
    }

    // Use socket to load conversations if connected, fallback to API
    if (socket && socket.connected) {
      console.log("Coach loading conversations via socket");
      socket.emit("load_conversations");
    } else {
      console.log("Coach loading conversations via API (fallback)");
      try {
        const conversations = await getUserConversations(currentUser.id);
        setConversations(conversations);
      } catch (error) {
        console.error("Error loading conversations:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const loadMessages = async (conversationId: string) => {
    if (!currentUser.id) {
      console.warn("No coach ID available, skipping message load");
      return;
    }

    // Use socket to load messages if connected, fallback to API
    if (socket && socket.connected) {
      console.log("Coach loading messages via socket for conversation:", conversationId);
      socket.emit("load_messages", { conversationId });
    } else {
      console.log("Coach loading messages via API (fallback)");
      try {
        const { messages } = await getConversationMessages(
          conversationId,
          currentUser.id
        );
        setCurrentMessages(messages);
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    await loadMessages(conversation.id);

    // Join the conversation room for real-time updates
    if (socket && socket.connected) {
      console.log("Coach joining conversation room:", conversation.id);
      socket.emit("join_conversation", conversation.id);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !selectedConversation || sending) return;

    try {
      setSending(true);

      if (!socket || !socket.connected) {
        console.error("Socket not connected");
        return;
      }

      console.log("Coach sending message:", {
        conversationId: selectedConversation.id,
        content: newMessage,
        type: "TEXT",
      });

      // Join conversation room if not already joined
      socket.emit("join_conversation", selectedConversation.id);

      socket.emit("send_message", {
        conversationId: selectedConversation.id,
        content: newMessage,
        type: "TEXT",
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(
    (convo) =>
      convo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      convo.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r bg-white">
        <div className="flex h-full flex-col">
          <div className="border-b p-4">
            <h1 className="mb-4 text-xl font-semibold">Coach Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="space-y-2 p-2">
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No conversations yet
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <Card
                    key={conversation.id}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-gray-50",
                      selectedConversation?.id === conversation.id &&
                        "border-blue-500 bg-blue-50"
                    )}
                    onClick={() => handleSelectConversation(conversation)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start space-x-3">
                        <Avatar>
                          <AvatarImage src={conversation.avatar} />
                          <AvatarFallback>
                            {conversation.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center justify-between">
                            <h3 className="truncate font-medium">
                              {conversation.name}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {conversation.time}
                            </span>
                          </div>
                          <p className="truncate text-sm text-gray-600">
                            {conversation.lastMessage}
                          </p>
                          {conversation.unread > 0 && (
                            <div className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
                              {conversation.unread}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b bg-white p-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={selectedConversation.avatar} />
                  <AvatarFallback>
                    {selectedConversation.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">{selectedConversation.name}</h2>
                  <p className="text-sm text-gray-500">Student</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {currentMessages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex",
                      message.isMe ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-xs rounded-lg p-3 lg:max-w-md",
                        message.isMe
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-900"
                      )}
                    >
                      {!message.isMe && (
                        <p className="mb-1 text-xs font-medium text-gray-500">
                          {message.sender}
                        </p>
                      )}
                      <p className="text-sm">{message.text}</p>
                      <p
                        className={cn(
                          "mt-1 text-xs",
                          message.isMe ? "text-blue-100" : "text-gray-500"
                        )}
                      >
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t bg-white p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Button type="button" variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  disabled={sending}
                />
                <Button type="submit" disabled={sending || !newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center bg-gray-50">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">
                Welcome Coach!
              </h3>
              <p className="text-gray-500">
                Select a conversation to start messaging with your students
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CoachMessagingPage() {
  return (
    <div className="h-screen">
      <CoachMessagingPageContent />
    </div>
  );
}