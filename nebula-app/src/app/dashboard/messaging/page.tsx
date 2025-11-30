"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Send, MoreVertical, Paperclip, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { createAuthenticatedSocket } from "@/lib/socket";
import {
  getUserConversations,
  getConversationMessages,
  type Conversation,
  type Message,
} from "@/actions/messaging";
import { useAuth } from "@/hooks/use-auth";
import { getAccessToken } from "@/lib/auth-storage";

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
      console.log("Creating authenticated socket connection");
      const newSocket = createAuthenticatedSocket(currentUser.token);
      newSocket.connect();
      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
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

  const loadConversations = async () => {
    if (!currentUser.id) {
      console.warn("No user ID available, skipping conversation load");
      return;
    }

    try {
      setLoading(true);
      const data = await getUserConversations(currentUser.id);
      setConversations(data);

      // Auto-select first conversation if none selected
      if (!selectedConversation && data.length > 0) {
        const firstConvo = data[0];
        setSelectedConversation(firstConvo);
        await loadMessages(firstConvo.id);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    if (!currentUser.id) {
      console.warn("No user ID available, skipping message load");
      return;
    }

    // Use socket to load messages if connected, fallback to API
    if (socket && socket.connected) {
      console.log("Loading messages via socket for conversation:", conversationId);
      socket.emit("load_messages", { conversationId });
    } else {
      console.log("Loading messages via API (fallback)");
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
      console.log("Joining conversation room:", conversation.id);
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

      console.log("Sending message:", {
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
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="text-muted-foreground">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="grid md:grid-cols-4 flex-1">
        {/* Conversation List */}
        <div
          className={cn(
            "flex flex-col border-r",
            selectedConversation && "hidden md:flex"
          )}
        >
          <div className="border-b p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <p>No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((convo) => (
                <div
                  key={convo.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-4 p-4 hover:bg-muted/50",
                    selectedConversation?.id === convo.id && "bg-muted"
                  )}
                  onClick={() => handleSelectConversation(convo)}
                >
                  <Avatar>
                    <AvatarImage src={convo.avatar || undefined} />
                    <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="truncate font-semibold">{convo.name}</h4>
                      <p className="text-xs text-muted-foreground flex-shrink-0">
                        {convo.time}
                      </p>
                    </div>
                    <div className="flex items-start justify-between">
                      <p className="truncate text-sm text-muted-foreground">
                        {convo.lastMessage}
                      </p>
                      {convo.unread > 0 && (
                        <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground flex-shrink-0">
                          {convo.unread}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
        </div>

        {/* Chat Window */}
        <div
          className={cn(
            "md:col-span-3 flex flex-col h-full",
            !selectedConversation && "hidden md:flex"
          )}
        >
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-4 border-b p-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar>
                  <AvatarImage src={selectedConversation.avatar} />
                  <AvatarFallback>
                    {selectedConversation.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">{selectedConversation.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {selectedConversation.role}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="ml-auto">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1">
                <div className="space-y-6 p-6">
                  {currentMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex items-end gap-3",
                        msg.isMe ? "justify-end" : "justify-start"
                      )}
                    >
                      {!msg.isMe && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={selectedConversation.avatar || undefined}
                          />
                          <AvatarFallback>
                            {selectedConversation.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <Card
                        className={cn(
                          "max-w-xs md:max-w-md p-3 rounded-2xl",
                          msg.isMe
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-muted rounded-bl-none"
                        )}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p
                          className={cn(
                            "text-xs mt-2",
                            msg.isMe
                              ? "text-primary-foreground/70 text-right"
                              : "text-muted-foreground/70 text-left"
                          )}
                        >
                          {msg.timestamp}
                        </p>
                      </Card>
                      {msg.isMe && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={currentUser.avatar} />
                          <AvatarFallback>
                            {currentUser.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t bg-background p-4 z-10">
                <form onSubmit={handleSendMessage}>
                  <div className="relative">
                    <Input
                      placeholder="Type a message..."
                      className="pr-24"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center">
                      <Button variant="ghost" size="icon" type="button">
                        <Paperclip className="h-5 w-5 text-muted-foreground" />
                      </Button>
                      <Separator orientation="vertical" className="mx-1 h-6" />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        disabled={sending}
                      >
                        <Send className="h-5 w-5 text-primary" />
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
              <p>Select a conversation to start messaging</p>
            </div>
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
