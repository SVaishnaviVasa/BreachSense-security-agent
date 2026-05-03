import {
  SYSTEM_PROMPT as _SYSTEM_PROMPT,
  createAttackSimulationPrompt,
  createImpactAnalysisPrompt,
  createBreachResponsePrompt,
} from "./prompts";
import { getContext, setTarget, type ProjectContext } from "@/lib/context/store";
import { getDemoHelpMessage } from "./demo-responses";
import { createXai } from "@ai-sdk/xai";

// Initialize Grok AI model
const XAI_API_KEY = "xai-HSfIe7jmN6zVanDWTqk0XAF4SIfWnJwCjtAhRof0ErbnPFiIBZVuMkDaRTYm1JzX7QfuTz9GBuAJ9Ee0";

export const grokModel = createXai({
  apiKey: XAI_API_KEY,
});

// Re-export SYSTEM_PROMPT for use in API routes
export const SYSTEM_PROMPT = _SYSTEM_PROMPT;

// Re-export prompt creators
export { createAttackSimulationPrompt, createImpactAnalysisPrompt, createBreachResponsePrompt };

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
  return getDemoHelpMessage();
}
