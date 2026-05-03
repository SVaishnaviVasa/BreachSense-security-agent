"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef } from "react";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { StatusBadge } from "./status-badge";
import { QuickActions } from "./quick-actions";
import { Shield, Terminal, AlertCircle } from "lucide-react";
import { parseCommand, getHelpMessage } from "@/lib/ai/agent";
import { setTarget, getContext } from "@/lib/context/store";

export function ChatInterface() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, append, isLoading, error, setMessages } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: `**Welcome to BreachSense**

I'm your AI security agent. I can help you:
- **Simulate attacks** on your applications
- **Analyze breach impacts** from real-world incidents  
- **Provide incident response** guidance

**Quick Start:**
- Use \`/target https://your-app.com\` to register a target
- Use \`/break\` to simulate an attack
- Use \`/help\` to see all available commands

*Currently using OWASP Juice Shop as the default demo target.*`,
      },
    ],
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = async (message: string) => {
    const command = parseCommand(message);
    
    // Handle /target command locally for immediate feedback
    if (command.type === "target" && command.url) {
      const updatedContext = setTarget("default", command.url);
      
      // Add user message
      const userMessage = {
        id: `user-${Date.now()}`,
        role: "user" as const,
        content: message,
      };
      
      // Add assistant response
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant" as const,
        content: `**Target Registered Successfully**

**URL:** ${updatedContext.target}
**Detected Type:** ${updatedContext.type === "web" ? "Web Application" : "API Endpoint"}
**Environment:** ${updatedContext.environment}

You can now use \`/break\` to simulate an attack on this target.`,
      };
      
      setMessages([...messages, userMessage, assistantMessage]);
      return;
    }
    
    // Handle /help command locally
    if (command.type === "help") {
      const userMessage = {
        id: `user-${Date.now()}`,
        role: "user" as const,
        content: message,
      };
      
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant" as const,
        content: getHelpMessage(),
      };
      
      setMessages([...messages, userMessage, assistantMessage]);
      return;
    }
    
    // For other commands and messages, use the API
    await append({
      role: "user",
      content: message,
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">BreachSense</h1>
            <p className="text-xs text-muted-foreground">AI Security Agent</p>
          </div>
        </div>
        <StatusBadge status="demo" platform="web" />
      </header>

      {/* Target Context Banner */}
      <div className="flex items-center gap-2 px-4 py-2 bg-secondary/30 border-b border-border">
        <Terminal className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          Current target:{" "}
          <code className="text-primary">{getContext().target}</code>
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role as "user" | "assistant"}
              content={message.content}
              isStreaming={isLoading && message.id === messages[messages.length - 1]?.id && message.role === "assistant"}
            />
          ))}
          
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex items-center gap-2 text-muted-foreground p-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-sm">Analyzing...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Error: {error.message}</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border p-4 bg-card">
        <div className="max-w-3xl mx-auto space-y-3">
          {messages.length <= 1 && (
            <div className="pb-2">
              <p className="text-xs text-muted-foreground mb-2">Quick actions:</p>
              <QuickActions onAction={handleSubmit} disabled={isLoading} />
            </div>
          )}
          <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
