"use client";

import React from "react";
import { MessageSquare } from "lucide-react";

interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = "Select a conversation to start messaging" }: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-gray-50/50">
      <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-gray-100 mb-4 animate-bounce-subtle">
        <MessageSquare className="h-8 w-8 text-primary/40" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">Your Inbox</h3>
      <p className="text-sm text-gray-500 max-w-[240px] text-center leading-relaxed">
        {message}
      </p>
    </div>
  );
}
