"use client";

import React from "react";

interface TypingIndicatorProps {
  userName: string;
}

export function TypingIndicator({ userName }: TypingIndicatorProps) {
  return (
    <div className="ml-6 py-2">
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
        </div>
        <span className="text-xs font-medium text-gray-400 italic">
          {userName} is typing...
        </span>
      </div>
    </div>
  );
}
