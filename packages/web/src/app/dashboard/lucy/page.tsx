
"use client";
import { useState, useRef, useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import { useSendAgentMessage } from "@/hooks/use-agents-queries";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUp, MessageSquare, User, Bot, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { MessageList, type Message } from "./_components/message-list";
import { ChatInput } from "./_components/chat-input";
import { WelcomeHero } from "./_components/welcome-hero";

const studentSuggestions = [
  {
    title: "Find a coach",
    prompt: "Help me find a coach based on my interests",
  },
  {
    title: "Book a coaching session",
    prompt: "I want to book a coaching session",
  },
  {
    title: "Explore programs",
    prompt: "Show me available learning programs",
  },
  {
    title: "Discover events",
    prompt: "What events are happening this week?",
  },
  {
    title: "Career advice",
    prompt: "Help me prepare for internships",
  },
];

const coachSuggestions = [
  {
    title: "Find students",
    prompt: "How can I find more students for my programs?",
  },
  {
    title: "Manage sessions",
    prompt: "Help me manage my upcoming coaching sessions",
  },
  {
    title: "Improve my profile",
    prompt: "How can I improve my coaching profile to attract more students?",
  },
  {
    title: "Earnings report",
    prompt: "Show me a summary of my recent earnings",
  },
];

export default function LucyPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const { profile } = useUser();
  const { mutate: sendMessage, isPending: loading } = useSendAgentMessage();

  const handleSend = (text?: string) => {
    const messageToSend = text || input;
    if (!messageToSend.trim() || !profile) return;

    const userMessage: Message = { role: "user", content: messageToSend, type: "text" };
    setMessages((prev) => [...prev, userMessage]);
    if (!text) setInput("");

    sendMessage(
      {
        message: messageToSend,
      },
      {
        onSuccess: (data: any) => {
          const raw = data.data || data.response || "I couldn't process that request.";

          let assistantMessage: Message;

          try {
            // Case 1: Response is already an object with the expected structure
            if (typeof raw === 'object' && raw !== null) {
              assistantMessage = {
                role: "assistant",
                type: raw.type || "text",
                content: typeof raw.content === 'string' ? raw.content : (raw.data || ""),
                coaches: raw.coaches,
                programs: raw.programs
              };
            }
            // Case 2: Response is a JSON string
            else if (typeof raw === 'string' && (raw.startsWith("{") || raw.startsWith("["))) {
              const parsed = JSON.parse(raw);
              assistantMessage = {
                role: "assistant",
                type: parsed.type || "text",
                content: typeof parsed.content === 'string' ? parsed.content : (parsed.data || ""),
                coaches: parsed.coaches,
                programs: parsed.programs
              };
            }
            else {
              assistantMessage = {
                role: "assistant",
                type: "text",
                content: String(raw)
              };
            }
          } catch (e) {
            console.error("Error parsing assistant message:", e);
            assistantMessage = {
              role: "assistant",
              type: "text",
              content: String(raw)
            };
          }

          setMessages((prev) => [...prev, assistantMessage]);
        },
      },
    );
  };

  const suggestions = profile?.role === "COACH" ? coachSuggestions : studentSuggestions;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-2rem)] bg-background relative overflow-hidden">
      {/* Content Area */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto px-6 pt-12 pb-32">
            {messages.length === 0 ? (
              <WelcomeHero
                suggestions={suggestions}
                onSelectSuggestion={(prompt) => setInput(prompt)}
              />
            ) : (
              <MessageList messages={messages} loading={loading} />
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={() => handleSend()}
          loading={loading}
        />
      </div>
    </div>
  );
}
