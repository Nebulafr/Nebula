"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  message?: string;
  className?: string;
  fullPage?: boolean;
}

export function Loading({ message, className, fullPage = false }: LoadingProps) {
  const content = (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {message && <p className="text-sm text-muted-foreground animate-pulse">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}
