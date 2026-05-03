import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import {
  SYSTEM_PROMPT as _SYSTEM_PROMPT,
  createAttackSimulationPrompt,
  createImpactAnalysisPrompt,
  createBreachResponsePrompt,
} from "./prompts";
import { getContext, setTarget, type ProjectContext } from "@/lib/context/store";

// Using Google Gemini directly
export const geminiModel = google("gemini-2.0-flash-001", {
  apiKey: process.env.GOOGLE_AI_API_KEY,
});

// Re-export SYSTEM_PROMPT for use in API routes
export const SYSTEM_PROMPT = _SYSTEM_PROMPT;

export type Command = 
  | { type: "target"; url: string }
  | { type: "break" }
  | { type: "impact"; incident: string }
  | { type: "breach"; breachType: string }
  | { type: "help" }
  | { type: "chat"; message: string };

export function parseCommand(text: string): Command {
  const trimmed = text.trim();
  
  // /target <url>
  if (trimmed.startsWith("/target")) {
    const url = trimmed.replace("/target", "").trim();
    return { type: "target", url };
  }
  
  // /break
  if (trimmed.startsWith("/break")) {
    return { type: "break" };
  }
  
  // /impact <incident>
  if (trimmed.startsWith("/impact")) {
    const incident = trimmed.replace("/impact", "").trim();
    return { type: "impact", incident };
  }
  
  // /breach <type>
  if (trimmed.startsWith("/breach")) {
    const breachType = trimmed.replace("/breach", "").trim();
    return { type: "breach", breachType };
  }
  
  // /help
  if (trimmed.startsWith("/help")) {
    return { type: "help" };
  }
  
  // Regular chat message
  return { type: "chat", message: trimmed };
}

export function getHelpMessage(): string {
  return `**🛡️ BreachSense Commands**

**/target <url>** - Register a target website or API
Example: \`/target https://example.com\`

**/break** - Simulate an attack on the current target
Analyzes vulnerabilities and generates an attack chain

**/impact <incident>** - Analyze impact of a security incident
Examples:
- \`/impact vercel breach\`
- \`/impact api key leak\`
- \`/impact oauth compromise\`

**/breach <type>** - Simulate an internal breach scenario
Examples:
- \`/breach .env leak\`
- \`/breach token exposure\`

**/help** - Show this help message

**Current Target:** Use \`/target\` to set a new target, or the default OWASP Juice Shop will be used for demonstrations.`;
}

export async function handleCommand(
  command: Command,
  sessionId: string = "default"
) {
  const context = getContext(sessionId);

  switch (command.type) {
    case "target": {
      if (!command.url) {
        return {
          type: "text" as const,
          content: "Please provide a URL. Example: `/target https://example.com`",
        };
      }
      const updatedContext = setTarget(sessionId, command.url);
      return {
        type: "text" as const,
        content: `**✅ Target Registered Successfully**

**URL:** ${updatedContext.target}
**Detected Type:** ${updatedContext.type === "web" ? "Web Application" : "API Endpoint"}
**Environment:** ${updatedContext.environment}

You can now use \`/break\` to simulate an attack on this target.`,
      };
    }

    case "break": {
      return {
        type: "stream" as const,
        stream: streamText({
          model: geminiModel,
          system: SYSTEM_PROMPT,
          prompt: createAttackSimulationPrompt(context),
        }),
      };
    }

    case "impact": {
      const incident = command.incident || "api key leak";
      return {
        type: "stream" as const,
        stream: streamText({
          model: geminiModel,
          system: SYSTEM_PROMPT,
          prompt: createImpactAnalysisPrompt(incident, context),
        }),
      };
    }

    case "breach": {
      const breachType = command.breachType || ".env leak";
      return {
        type: "stream" as const,
        stream: streamText({
          model: geminiModel,
          system: SYSTEM_PROMPT,
          prompt: createBreachResponsePrompt(breachType, context),
        }),
      };
    }

    case "help": {
      return {
        type: "text" as const,
        content: getHelpMessage(),
      };
    }

    case "chat": {
      return {
        type: "stream" as const,
        stream: streamText({
          model: geminiModel,
          system: SYSTEM_PROMPT,
          prompt: `User question about security: ${command.message}

Context:
- Current target: ${context.target}
- Type: ${context.type}
- Environment: ${context.environment}

Provide a helpful, security-focused response. If the user seems to want to run a command, suggest the appropriate BreachSense command (/target, /break, /impact, /breach).`,
        }),
      };
    }
  }
}

// For use with AI SDK's message format (web chat)
export function createAgentStreamFromMessages(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  sessionId: string = "default"
) {
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== "user") {
    return streamText({
      model: geminiModel,
      system: SYSTEM_PROMPT,
      messages,
    });
  }

  const command = parseCommand(lastMessage.content);
  const context = getContext(sessionId);

  // For commands that need AI responses
  if (command.type === "break") {
    return streamText({
      model: geminiModel,
      system: SYSTEM_PROMPT,
      prompt: createAttackSimulationPrompt(context),
    });
  }

  if (command.type === "impact") {
    return streamText({
      model: geminiModel,
      system: SYSTEM_PROMPT,
      prompt: createImpactAnalysisPrompt(command.incident || "api key leak", context),
    });
  }

  if (command.type === "breach") {
    return streamText({
      model: geminiModel,
      system: SYSTEM_PROMPT,
      prompt: createBreachResponsePrompt(command.breachType || ".env leak", context),
    });
  }

  // For regular chat, use the full message history
  return streamText({
    model: geminiModel,
    system: SYSTEM_PROMPT,
    messages,
  });
}
