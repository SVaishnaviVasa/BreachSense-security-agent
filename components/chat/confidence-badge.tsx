"use client";

import { cn } from "@/lib/utils";
import { Target, CircleDot, Circle } from "lucide-react";

type ConfidenceLevel = "high" | "medium" | "low";

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  showIcon?: boolean;
  className?: string;
}

const confidenceConfig: Record<ConfidenceLevel, {
  label: string;
  bgColor: string;
  textColor: string;
  icon: typeof Target;
}> = {
  high: {
    label: "HIGH CONFIDENCE",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-400",
    icon: Target,
  },
  medium: {
    label: "MEDIUM CONFIDENCE",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-400",
    icon: CircleDot,
  },
  low: {
    label: "LOW CONFIDENCE",
    bgColor: "bg-slate-500/10",
    textColor: "text-slate-400",
    icon: Circle,
  },
};

export function ConfidenceBadge({ level, showIcon = true, className }: ConfidenceBadgeProps) {
  const config = confidenceConfig[level];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium rounded px-2 py-0.5",
        config.bgColor,
        config.textColor,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </span>
  );
}
