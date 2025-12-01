"use client";

interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ 
  message = "Select a conversation to start messaging" 
}: EmptyStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center text-muted-foreground">
      <p>{message}</p>
    </div>
  );
}