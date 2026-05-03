"use client";

import { cn } from "@/lib/utils";
import { Target, Zap, Globe, AlertTriangle, HelpCircle } from "lucide-react";

interface CommandSuggestionsProps {
  onSelect: (command: string) => void;
  filter?: string;
  visible: boolean;
}

const commands = [
  {
    command: "/target",
    description: "Register a target URL",
    example: "/target https://example.com",
    icon: Target,
  },
  {
    command: "/break",
    description: "Simulate attack on target",
    example: "/break",
    icon: Zap,
  },
  {
    command: "/impact",
    description: "Analyze breach impact",
    example: "/impact vercel breach",
    icon: Globe,
  },
  {
    command: "/breach",
    description: "Simulate internal breach",
    example: "/breach .env leak",
    icon: AlertTriangle,
  },
  {
    command: "/help",
    description: "Show available commands",
    example: "/help",
    icon: HelpCircle,
  },
];

export function CommandSuggestions({
  onSelect,
  filter = "",
  visible,
}: CommandSuggestionsProps) {
  if (!visible) return null;

  const filteredCommands = filter
    ? commands.filter(
        (cmd) =>
          cmd.command.toLowerCase().includes(filter.toLowerCase()) ||
          cmd.description.toLowerCase().includes(filter.toLowerCase())
      )
    : commands;

  if (filteredCommands.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-10">
      <div className="p-2 border-b border-border">
        <span className="text-xs font-medium text-muted-foreground">
          Commands
        </span>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {filteredCommands.map((cmd) => {
          const Icon = cmd.icon;
          return (
            <button
              key={cmd.command}
              onClick={() => onSelect(cmd.example)}
              className={cn(
                "w-full flex items-center gap-3 p-3 text-left",
                "hover:bg-secondary/50 transition-colors",
                "focus:outline-none focus:bg-secondary/50"
              )}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-primary">
                    {cmd.command}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {cmd.description}
                </p>
              </div>
              <span className="text-xs text-muted-foreground font-mono hidden sm:block">
                {cmd.example}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
