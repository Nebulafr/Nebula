
"use client";

import { useRef, useEffect } from "react";
import { User, Bot, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LucyCoachCard } from "./lucy-coach-card";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export type Message = {
  role: "user" | "assistant";
  type: "text" | "coach_list" | "program_list";
  content?: string;
  coaches?: any[];
  programs?: any[];
};

interface MessageListProps {
  messages: Message[];
  loading: boolean;
}

export function MessageList({ messages, loading }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  return (
    <div className="space-y-8 pb-32 pt-4">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={cn(
            "flex gap-4 group w-full",
            msg.role === "user" ? "flex-col items-end" : "flex-col items-start"
          )}
        >
          <div
            className={cn(
              "max-w-[90%] md:max-w-[85%] p-4 rounded-3xl shadow-sm text-[15px] leading-relaxed",
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-tr-sm px-5 py-3"
                : "bg-muted/50 text-foreground rounded-tl-sm border border-border/10"
            )}
          >
            {msg.role === "assistant" && (
              <div className="flex items-center gap-2 mb-3 -ml-1">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Bot className="h-3 w-3 text-primary-foreground" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider opacity-50">Nebula AI</span>
              </div>
            )}

            {msg.content && (
              <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none 
                prose-p:leading-7 prose-p:mb-4 last:prose-p:mb-0
                prose-headings:font-bold prose-headings:tracking-tight prose-headings:mb-4
                prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                prose-pre:bg-card prose-pre:border prose-pre:border-border/50 prose-pre:rounded-xl prose-pre:p-4
                prose-code:text-primary prose-code:bg-primary/10 prose-code:rounded prose-code:px-1 prose-code:py-0.5"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
              </div>
            )}
            
            {msg.type === "coach_list" && msg.coaches && (
              <div className="grid grid-cols-1 gap-3 mt-6">
                {msg.coaches.map((coach: any) => (
                  <Link key={coach.id} href={`/coaches/${coach.id}`} target="_blank">
                    <LucyCoachCard coach={coach} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
      
      {loading && (
        <div className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2 -ml-1">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Bot className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-50">Thinking</span>
          </div>
          <div className="bg-muted/30 p-4 rounded-3xl rounded-tl-sm border border-border/10 flex items-center gap-3">
            <div className="flex gap-1.5">
               <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce" />
               <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.2s]" />
               <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        </div>
      )}
      <div ref={scrollRef} />
    </div>
  );
}
