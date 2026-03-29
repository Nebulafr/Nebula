import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Mic, AudioLines, ArrowUp } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  loading: boolean;
}

export function ChatInput({ input, setInput, onSend, loading }: ChatInputProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 py-8 px-6 bg-gradient-to-t from-background via-background to-transparent z-20">
      <div className="max-w-3xl mx-auto relative">
        <div className="relative flex items-center bg-card border border-border/50 rounded-[28px] shadow-2xl px-2 py-2 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
          {/* Plus Icon - Left */}
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10 rounded-full hover:bg-muted shrink-0"
            disabled={loading}
          >
            <Plus className="h-5 w-5 opacity-70" />
          </Button>

          <Input
            placeholder="Ask anything"
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-base h-11 px-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            disabled={loading}
          />

          {/* Right Icons Group */}
          <div className="flex items-center gap-1 shrink-0 ml-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-full hover:bg-muted group"
              disabled={loading}
            >
              <Mic className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" />
            </Button>
            
            {input.trim() ? (
              <Button
                size="icon"
                className="h-10 w-10 rounded-full shadow-lg bg-foreground text-background hover:bg-foreground/90 transition-transform active:scale-95"
                onClick={() => onSend()}
                disabled={loading}
              >
                <ArrowUp className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10 rounded-full hover:bg-muted group"
                disabled={loading}
              >
                <AudioLines className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" />
              </Button>
            )}
          </div>
        </div>
        
        <p className="text-[11px] text-center text-muted-foreground/60 mt-3 font-medium">
          Lucy can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}
