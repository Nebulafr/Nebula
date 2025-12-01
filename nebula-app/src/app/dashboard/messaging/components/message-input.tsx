"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Paperclip, Send } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({ 
  onSendMessage, 
  disabled = false,
  placeholder = "Type a message..." 
}: MessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  return (
    <div className="border-t bg-background p-4 z-10">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Input
            placeholder={placeholder}
            className="pr-24"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={disabled}
          />
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center">
            <Button variant="ghost" size="icon" type="button" disabled={disabled}>
              <Paperclip className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Separator orientation="vertical" className="mx-1 h-6" />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              disabled={disabled || !message.trim()}
            >
              <Send className="h-5 w-5 text-primary" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}