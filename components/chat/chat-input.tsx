"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CommandSuggestions } from "./command-suggestions";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSubmit, isLoading, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Show suggestions when typing a command
  const commandFilter = input.startsWith("/") ? input : "";
  const shouldShowSuggestions = showSuggestions && input.startsWith("/");

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    if (!input.trim() || isLoading || disabled) return;
    onSubmit(input.trim());
    setInput("");
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleCommandSelect = (command: string) => {
    setInput(command);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="relative">
      <CommandSuggestions
        onSelect={handleCommandSelect}
        filter={commandFilter}
        visible={shouldShowSuggestions}
      />
      <div className="flex gap-2 items-end p-4 bg-card border border-border rounded-lg">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(e.target.value.startsWith("/"));
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => input.startsWith("/") && setShowSuggestions(true)}
          placeholder="Type a command (/) or ask a security question..."
          className={cn(
            "flex-1 min-h-[44px] max-h-[150px] resize-none",
            "bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0",
            "text-foreground placeholder:text-muted-foreground"
          )}
          disabled={disabled}
          rows={1}
        />
        <Button
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading || disabled}
          size="icon"
          className="h-10 w-10 shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="flex items-center justify-between mt-2 px-1">
        <p className="text-xs text-muted-foreground">
          Type <code className="bg-muted px-1 rounded">/</code> for commands
        </p>
        <p className="text-xs text-muted-foreground">
          Press <kbd className="bg-muted px-1.5 py-0.5 rounded text-xs">Enter</kbd> to send
        </p>
      </div>
    </div>
  );
}
