"use client";

import { Button } from "@/components/ui/button";
import { Target, Zap, Globe, AlertTriangle, Key, Shield } from "lucide-react";

interface QuickActionsProps {
  onAction: (command: string) => void;
  disabled?: boolean;
}

const actions = [
  {
    label: "Simulate Attack",
    command: "/break",
    icon: Zap,
    variant: "destructive" as const,
    description: "Run attack simulation",
  },
  {
    label: "API Key Leak",
    command: "/impact api key leak",
    icon: Key,
    variant: "outline" as const,
    description: "Analyze API key exposure",
  },
  {
    label: "OAuth Breach",
    command: "/impact oauth compromise",
    icon: Shield,
    variant: "outline" as const,
    description: "OAuth token compromise",
  },
  {
    label: ".env Exposure",
    command: "/breach .env leak",
    icon: AlertTriangle,
    variant: "outline" as const,
    description: "Environment file leaked",
  },
  {
    label: "Vercel Breach",
    command: "/impact vercel breach",
    icon: Globe,
    variant: "outline" as const,
    description: "Deployment platform breach",
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
            className="gap-1.5"
          >
            <Icon className="h-3.5 w-3.5" />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
