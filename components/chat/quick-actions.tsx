"use client";

import { Button } from "@/components/ui/button";
import { Target, Zap, Globe, AlertTriangle } from "lucide-react";

interface QuickActionsProps {
  onAction: (command: string) => void;
  disabled?: boolean;
}

const actions = [
  {
    label: "Attack Demo",
    command: "/break",
    icon: Zap,
    variant: "destructive" as const,
  },
  {
    label: "Vercel Breach",
    command: "/impact vercel breach",
    icon: Globe,
    variant: "outline" as const,
  },
  {
    label: ".env Leak",
    command: "/breach .env leak",
    icon: AlertTriangle,
    variant: "outline" as const,
  },
  {
    label: "Set Target",
    command: "/target https://juice-shop.herokuapp.com",
    icon: Target,
    variant: "secondary" as const,
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
