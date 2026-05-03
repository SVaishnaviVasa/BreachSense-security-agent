"use client";

import { cn } from "@/lib/utils";
import { Bot, User, Shield, Zap, AlertTriangle, Target } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { SeverityBadge, parseSeverity } from "./severity-badge";
import { ChatSDKBadge } from "./chatsdk-badge";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

// Detect response type from content
function detectResponseType(content: string): "attack" | "impact" | "breach" | "help" | "general" {
  const lower = content.toLowerCase();
  if (lower.includes("attack simulation") || lower.includes("/break")) return "attack";
  if (lower.includes("breach impact") || lower.includes("impact analysis") || lower.includes("why you are affected")) return "impact";
  if (lower.includes("breach response") || lower.includes("incident response") || lower.includes("priority actions")) return "breach";
  if (lower.includes("available commands") || lower.includes("breachsense - ai security")) return "help";
  return "general";
}

// Extract severity from content
function extractSeverity(content: string): "critical" | "high" | "medium" | "low" | null {
  const match = content.match(/severity[:\s]*(critical|high|medium|low)/i);
  if (match) return match[1].toLowerCase() as "critical" | "high" | "medium" | "low";
  if (content.includes("CRITICAL")) return "critical";
  if (content.includes("### SEVERITY: HIGH") || content.match(/severity[:\s]*high/i)) return "high";
  if (content.includes("### SEVERITY: MEDIUM") || content.match(/severity[:\s]*medium/i)) return "medium";
  return null;
}

const typeConfig = {
  attack: {
    icon: Zap,
    label: "Attack Simulation",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
  impact: {
    icon: Target,
    label: "Impact Analysis",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
  },
  breach: {
    icon: AlertTriangle,
    label: "Breach Response",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
  },
  help: {
    icon: Shield,
    label: "BreachSense Help",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
  },
  general: {
    icon: Bot,
    label: "BreachSense",
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/30",
  },
};

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isUser = role === "user";
  const responseType = !isUser ? detectResponseType(content) : "general";
  const severity = !isUser ? extractSeverity(content) : null;
  const config = typeConfig[responseType];
  const TypeIcon = config.icon;

  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-lg",
        isUser 
          ? "bg-secondary/50" 
          : cn("border", config.bg, config.border)
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : cn("bg-card border border-border", config.color)
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <TypeIcon className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn(
            "text-xs font-medium",
            isUser ? "text-muted-foreground" : config.color
          )}>
            {isUser ? "You" : config.label}
          </span>
          {!isUser && severity && (
            <SeverityBadge level={severity} size="sm" />
          )}
        </div>
        <div className="prose-chat text-sm text-foreground">
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{content}</p>
          ) : (
            <div className="space-y-1">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => (
                    <h2 className="text-lg font-bold text-foreground mt-4 mb-2 first:mt-0 flex items-center gap-2">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => {
                    const text = String(children);
                    // Highlight severity headers
                    if (text.includes("SEVERITY:") || text.includes("CRITICAL") || text.includes("HIGH")) {
                      return (
                        <h3 className="text-base font-bold text-red-400 mt-3 mb-1 uppercase tracking-wide">
                          {children}
                        </h3>
                      );
                    }
                    if (text.includes("WHY YOU ARE AFFECTED") || text.includes("POTENTIAL DAMAGE")) {
                      return (
                        <h3 className="text-base font-bold text-orange-400 mt-3 mb-1">
                          {children}
                        </h3>
                      );
                    }
                    if (text.includes("IMMEDIATE ACTIONS") || text.includes("PRIORITY")) {
                      return (
                        <h3 className="text-base font-bold text-yellow-400 mt-3 mb-1">
                          {children}
                        </h3>
                      );
                    }
                    return (
                      <h3 className="text-base font-semibold text-foreground mt-3 mb-1">
                        {children}
                      </h3>
                    );
                  },
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-1 my-2">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-1 my-2">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-muted-foreground">{children}</li>
                  ),
                  code: ({ children, className }) => {
                    const isInline = !className;
                    const codeContent = String(children);
                    
                    // Highlight attack payloads
                    if (codeContent.includes("OR 1=1") || 
                        codeContent.includes("<script>") || 
                        codeContent.includes("onerror=") ||
                        codeContent.includes("admin'--")) {
                      return isInline ? (
                        <code className="bg-red-500/20 border border-red-500/30 px-1.5 py-0.5 rounded text-sm font-mono text-red-400">
                          {children}
                        </code>
                      ) : (
                        <code className={className}>{children}</code>
                      );
                    }
                    
                    return isInline ? (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary">
                        {children}
                      </code>
                    ) : (
                      <code className={className}>{children}</code>
                    );
                  },
                  pre: ({ children }) => (
                    <pre className="bg-card border border-border p-3 rounded-lg overflow-x-auto my-2 text-sm">
                      {children}
                    </pre>
                  ),
                  p: ({ children }) => {
                    const text = String(children);
                    // Highlight urgent time statements
                    if (text.includes("within MINUTES") || text.includes("within minutes") || text.includes("IMMEDIATE")) {
                      return <p className="my-1 text-red-400 font-medium">{children}</p>;
                    }
                    return <p className="my-1">{children}</p>;
                  },
                  strong: ({ children }) => {
                    const text = String(children);
                    // Color code severity words
                    if (text === "CRITICAL" || text.includes("CRITICAL")) {
                      return <strong className="font-bold text-red-400">{children}</strong>;
                    }
                    if (text === "HIGH" || text.includes("HIGH")) {
                      return <strong className="font-bold text-orange-400">{children}</strong>;
                    }
                    if (text === "MEDIUM" || text.includes("MEDIUM")) {
                      return <strong className="font-bold text-yellow-400">{children}</strong>;
                    }
                    if (text === "LOW" || text.includes("LOW")) {
                      return <strong className="font-bold text-green-400">{children}</strong>;
                    }
                    return (
                      <strong className="font-semibold text-foreground">
                        {children}
                      </strong>
                    );
                  },
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-2">
                      <table className="w-full text-sm border-collapse">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-muted/50">{children}</thead>
                  ),
                  th: ({ children }) => (
                    <th className="border border-border px-3 py-2 text-left font-semibold text-foreground">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => {
                    const text = String(children);
                    // Color code severity in table cells
                    if (text === "CRITICAL" || text.includes("CRITICAL")) {
                      return <td className="border border-border px-3 py-2 text-red-400 font-medium">{children}</td>;
                    }
                    if (text === "HIGH" || text.includes("HIGH")) {
                      return <td className="border border-border px-3 py-2 text-orange-400 font-medium">{children}</td>;
                    }
                    if (text === "MEDIUM" || text.includes("MEDIUM")) {
                      return <td className="border border-border px-3 py-2 text-yellow-400 font-medium">{children}</td>;
                    }
                    if (text === "YES" || text === "Exploitable") {
                      return <td className="border border-border px-3 py-2 text-red-400 font-medium">{children}</td>;
                    }
                    return (
                      <td className="border border-border px-3 py-2 text-muted-foreground">
                        {children}
                      </td>
                    );
                  },
                  tr: ({ children }) => (
                    <tr className="hover:bg-muted/30 transition-colors">{children}</tr>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
              {/* ChatSDK footer for assistant messages */}
              {content.includes("ChatSDK platforms") && (
                <div className="mt-4 pt-3 border-t border-border">
                  <ChatSDKBadge />
                </div>
              )}
            </div>
          )}
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse rounded-sm" />
          )}
        </div>
      </div>
    </div>
  );
}
