"use client";

import { useState } from "react";
import { X, Globe, Server, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TargetSettingsProps {
  currentTarget: string;
  onTargetChange: (target: string) => void;
  onClose: () => void;
}

const PRESET_TARGETS = [
  {
    name: "OWASP Juice Shop",
    url: "https://juice-shop.herokuapp.com",
    type: "web",
    description: "Intentionally vulnerable web app for security training",
  },
  {
    name: "DVWA",
    url: "https://dvwa.herokuapp.com",
    type: "web",
    description: "Damn Vulnerable Web Application",
  },
  {
    name: "HTTPBin",
    url: "https://httpbin.org",
    type: "api",
    description: "HTTP request/response testing service",
  },
  {
    name: "JSONPlaceholder",
    url: "https://jsonplaceholder.typicode.com",
    type: "api",
    description: "Fake REST API for testing",
  },
];

export function TargetSettings({ currentTarget, onTargetChange, onClose }: TargetSettingsProps) {
  const [customUrl, setCustomUrl] = useState(currentTarget);
  const [error, setError] = useState("");

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      new URL(customUrl);
      onTargetChange(customUrl);
    } catch {
      setError("Please enter a valid URL (e.g., https://example.com)");
    }
  };

  const handlePresetSelect = (url: string) => {
    setCustomUrl(url);
    onTargetChange(url);
  };

  return (
    <div className="border-b border-border bg-card/50 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">Target Settings</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Custom URL Input */}
        <form onSubmit={handleCustomSubmit} className="mb-4">
          <Label htmlFor="target-url" className="text-xs text-muted-foreground mb-2 block">
            Custom Target URL
          </Label>
          <div className="flex gap-2">
            <Input
              id="target-url"
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://your-app.com or https://api.example.com"
              className="flex-1 bg-background"
            />
            <Button type="submit" size="sm">
              Set Target
            </Button>
          </div>
          {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </form>

        {/* Preset Targets */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">
            Or choose a preset target for testing:
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRESET_TARGETS.map((preset) => (
              <button
                key={preset.url}
                onClick={() => handlePresetSelect(preset.url)}
                className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
                  currentTarget === preset.url
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background hover:border-primary/50 hover:bg-secondary/30"
                }`}
              >
                {preset.type === "web" ? (
                  <Globe className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                ) : (
                  <Server className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-foreground">{preset.name}</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{preset.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Note: BreachSense simulates security analysis. Always ensure you have permission to test any target.
        </p>
      </div>
    </div>
  );
}
