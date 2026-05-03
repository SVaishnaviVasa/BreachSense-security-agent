"use client";

import { cn } from "@/lib/utils";
import { MessageSquare } from "lucide-react";

interface ChatSDKBadgeProps {
  variant?: "default" | "compact";
  className?: string;
}

export function ChatSDKBadge({ variant = "default", className }: ChatSDKBadgeProps) {
  if (variant === "compact") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs text-muted-foreground",
          className
        )}
      >
        <MessageSquare className="h-3 w-3" />
        <span>ChatSDK</span>
      </span>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
        "bg-gradient-to-r from-primary/10 to-accent/10",
        "border border-primary/20",
        "text-xs font-medium",
        className
      )}
    >
      <MessageSquare className="h-3.5 w-3.5 text-primary" />
      <span className="text-foreground">Running on ChatSDK</span>
      <span className="text-muted-foreground">(Slack + Discord ready)</span>
    </div>
  );
}
