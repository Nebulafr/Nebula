"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSendMessage,
  disabled = false,
  placeholder = "Type a message...",
}: MessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleAttachment = () => {
    // TODO: Implement file attachment
    console.log("Attachment clicked");
  };

  return (
    <div className="border-t border-gray-200 bg-white p-6">
      <form onSubmit={handleSubmit} className="flex items-center w-full">
        <div className="flex-1 relative">
          <Input
            value={message || ""}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            className="w-full pr-24 py-3 px-4 rounded-xl border border-gray-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
            disabled={disabled}
          />
          
          {/* Right-side action area */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAttachment}
              disabled={disabled}
              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
            >
              <Paperclip className="h-4 w-4 text-gray-500" />
            </Button>
            
            {/* Vertical separator line */}
            <div className="w-px h-4 bg-gray-300" />
            
            <Button
              type="submit"
              size="sm"
              disabled={disabled || !message.trim()}
              className="h-8 w-8 p-0 rounded-full"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}