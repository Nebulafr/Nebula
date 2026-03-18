"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, Paperclip, Send, Smile } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTyping: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSendMessage,
  onTyping,
  disabled = false,
  placeholder = "Type your message...",
}: MessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-6 py-4 bg-white border-t border-gray-200">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 pr-2">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-primary hover:bg-primary/5 h-9 w-9">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-primary hover:bg-primary/5 h-9 w-9">
            <ImageIcon className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 relative group">
          <Input
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              onTyping();
            }}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="pr-12 py-6 bg-gray-50 border-transparent focus:bg-white focus:border-primary/20 
                     rounded-2xl transition-all duration-200 text-sm shadow-inner"
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary h-8 w-8"
          >
            <Smile className="h-5 w-5" />
          </Button>
        </div>

        <Button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className="rounded-2xl h-[48px] px-6 bg-primary hover:bg-primary/90 shadow-md transition-all active:scale-95"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
