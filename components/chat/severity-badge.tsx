"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, AlertCircle, Info, CheckCircle } from "lucide-react";

type SeverityLevel = "critical" | "high" | "medium" | "low" | "info";

interface SeverityBadgeProps {
  level: SeverityLevel;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const severityConfig: Record<SeverityLevel, {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: typeof AlertTriangle;
}> = {
  critical: {
    label: "CRITICAL",
    bgColor: "bg-red-500/20",
    textColor: "text-red-400",
    borderColor: "border-red-500/50",
    icon: AlertTriangle,
  },
  high: {
    label: "HIGH",
    bgColor: "bg-orange-500/20",
    textColor: "text-orange-400",
    borderColor: "border-orange-500/50",
    icon: AlertTriangle,
  },
  medium: {
    label: "MEDIUM",
    bgColor: "bg-yellow-500/20",
    textColor: "text-yellow-400",
    borderColor: "border-yellow-500/50",
    icon: AlertCircle,
  },
  low: {
    label: "LOW",
    bgColor: "bg-green-500/20",
    textColor: "text-green-400",
    borderColor: "border-green-500/50",
    icon: CheckCircle,
  },
  info: {
    label: "INFO",
    bgColor: "bg-blue-500/20",
    textColor: "text-blue-400",
    borderColor: "border-blue-500/50",
    icon: Info,
  },
};

const sizeConfig = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
  lg: "text-base px-3 py-1.5",
};

export function SeverityBadge({ 
  level, 
  showIcon = true, 
  size = "md",
  className 
}: SeverityBadgeProps) {
  const config = severityConfig[level];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold rounded border",
        config.bgColor,
        config.textColor,
        config.borderColor,
        sizeConfig[size],
        className
      )}
    >
      {showIcon && <Icon className={cn(
        size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"
      )} />}
      {config.label}
    </span>
  );
}

export function parseSeverity(text: string): SeverityLevel {
  const lower = text.toLowerCase();
  if (lower.includes("critical")) return "critical";
  if (lower.includes("high")) return "high";
  if (lower.includes("medium")) return "medium";
  if (lower.includes("low")) return "low";
  return "info";
}
