"use client";

import { Button } from "@/components/ui/button";
import { Zap, Globe, AlertTriangle, Key, Shield, Database, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  onAction: (command: string) => void;
  disabled?: boolean;
}

const actions = [
  {
    label: "Simulate Attack",
    command: "/break",
    icon: Zap,
    variant: "default" as const,
    className: "bg-red-600 hover:bg-red-700 text-white border-red-700",
    description: "Run attack simulation on target",
  },
  {
    label: "Vercel Breach",
    command: "/impact vercel breach",
    icon: Globe,
    variant: "outline" as const,
    className: "border-orange-500/50 text-orange-400 hover:bg-orange-500/10",
    description: "Deployment platform compromised",
  },
  {
    label: "API Key Leak",
    command: "/impact api key leak",
    icon: Key,
    variant: "outline" as const,
    className: "border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10",
    description: "Analyze API key exposure",
  },
  {
    label: ".env Exposed",
    command: "/breach .env leak",
    icon: AlertTriangle,
    variant: "outline" as const,
    className: "border-red-500/50 text-red-400 hover:bg-red-500/10",
    description: "Environment file leaked",
  },
  {
    label: "DB Breach",
    command: "/breach database leak",
    icon: Database,
    variant: "outline" as const,
    className: "border-purple-500/50 text-purple-400 hover:bg-purple-500/10",
    description: "Database credentials exposed",
  },
  {
    label: "Help",
    command: "/help",
    icon: HelpCircle,
    variant: "outline" as const,
    className: "border-muted-foreground/30 text-muted-foreground hover:bg-muted",
    description: "Show all commands",
  },
];

export function QuickActions({ onAction, disabled }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.command}
            variant={action.variant}
            size="sm"
            onClick={() => onAction(action.command)}
            disabled={disabled}
            className={cn("gap-1.5 font-medium", action.className)}
            title={action.description}
          >
            <Icon className="h-3.5 w-3.5" />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
