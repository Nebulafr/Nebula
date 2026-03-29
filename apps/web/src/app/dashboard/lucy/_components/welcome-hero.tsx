
"use client";

import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Suggestion {
  title: string;
  prompt: string;
}

interface WelcomeHeroProps {
  suggestions: Suggestion[];
  onSelectSuggestion: (prompt: string) => void;
}

export function WelcomeHero({ suggestions, onSelectSuggestion }: WelcomeHeroProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-8 shadow-lg animate-in zoom-in duration-500">
        <Sparkles className="h-8 w-8 text-primary-foreground" />
      </div>
      
      <h1 className="text-3xl font-bold tracking-tight mb-2">
        How can I help you today?
      </h1>
      <p className="text-muted-foreground max-w-sm mb-12 text-sm leading-relaxed">
        I&apos;m Lucy, your Nebula assistant. I can help with coach discovery, 
        career guidance, and platform support.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        {suggestions.map((card) => (
          <Card
            key={card.title}
            className="p-4 text-left cursor-pointer hover:bg-muted/50 transition-all border-border/40 bg-card/30 hover:border-border hover:shadow-sm group translate-y-0 hover:-translate-y-0.5"
            onClick={() => onSelectSuggestion(card.prompt)}
          >
            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{card.title}</h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1 opacity-70">
              {card.prompt}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
