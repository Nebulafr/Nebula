"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowUp, MessageSquare } from "lucide-react";

const suggestionCards = [
  {
    title: "Find coaches",
    description: "Help me find a suitable coach",
  },
  {
    title: "Explore programs",
    description: "Show me popular programs",
  },
  {
    title: "Discover events",
    description: "What events are happening this week?",
  },
];

export default function LucyPage() {
  return (
    <div className="flex flex-col h-full items-center justify-center bg-background text-center p-4">
      <div className="flex-grow flex flex-col items-center justify-center w-full max-w-2xl">
        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-6">
          <MessageSquare className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          How can I help you?
        </h1>
        <div className="w-full mt-8">
          <div className="relative w-full">
            <Input
              placeholder="Ask me anything"
              className="h-14 rounded-full border-border pl-6 pr-14"
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            {suggestionCards.map((card) => (
              <Card
                key={card.title}
                className="p-4 text-left cursor-pointer hover:bg-muted"
              >
                <h3 className="font-semibold text-sm">{card.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
