"use client";

import { cn } from "@/lib/utils";
import { Shield, ShieldAlert, ShieldCheck, Wifi, WifiOff } from "lucide-react";

interface StatusBadgeProps {
  status: "connected" | "disconnected" | "demo";
  platform?: "web" | "slack" | "discord";
}

export function StatusBadge({ status, platform = "web" }: StatusBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
          status === "connected" && "bg-success/20 text-success",
          status === "disconnected" && "bg-destructive/20 text-destructive",
          status === "demo" && "bg-warning/20 text-warning"
        )}
      >
        {status === "connected" ? (
          <Wifi className="h-3 w-3" />
        ) : status === "disconnected" ? (
          <WifiOff className="h-3 w-3" />
        ) : (
          <Shield className="h-3 w-3" />
        )}
        <span className="capitalize">{status}</span>
      </div>
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
        {platform === "web" ? (
          <ShieldCheck className="h-3 w-3" />
        ) : (
          <ShieldAlert className="h-3 w-3" />
        )}
        <span className="capitalize">{platform}</span>
      </div>
    </div>
  );
}
