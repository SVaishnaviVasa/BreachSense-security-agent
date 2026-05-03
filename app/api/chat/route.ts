import { streamText, convertToModelMessages, UIMessage, consumeStream } from "ai";
import {
  MODEL,
  SYSTEM_PROMPT,
  parseCommand,
} from "@/lib/ai/agent";
import {
  createAttackSimulationPrompt,
  createImpactAnalysisPrompt,
  createBreachResponsePrompt,
} from "@/lib/ai/prompts";
import { getContext } from "@/lib/context/store";

export const maxDuration = 30;

// Helper to extract text from UIMessage
function getMessageText(message: UIMessage): string {
  if (!message.parts || !Array.isArray(message.parts)) return "";
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text" && typeof p.text === "string")
    .map((p) => p.text)
    .join("");
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  
  if (!messages || messages.length === 0) {
    return new Response("No messages provided", { status: 400 });
  }

  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== "user") {
    return new Response("No user message provided", { status: 400 });
  }

  const lastMessageText = getMessageText(lastMessage);
  const command = parseCommand(lastMessageText);
  const context = getContext("default");

  // Handle streaming commands
  let result;

  switch (command.type) {
    case "break":
      result = streamText({
        model: MODEL,
        system: SYSTEM_PROMPT,
        prompt: createAttackSimulationPrompt(context),
        abortSignal: req.signal,
      });
      break;

    case "impact":
      result = streamText({
        model: MODEL,
        system: SYSTEM_PROMPT,
        prompt: createImpactAnalysisPrompt(command.incident || "api key leak", context),
        abortSignal: req.signal,
      });
      break;

    case "breach":
      result = streamText({
        model: MODEL,
        system: SYSTEM_PROMPT,
        prompt: createBreachResponsePrompt(command.breachType || ".env leak", context),
        abortSignal: req.signal,
      });
      break;

    case "chat":
    default:
      // Convert UIMessages to model messages for general chat
      const modelMessages = await convertToModelMessages(messages);
      result = streamText({
        model: MODEL,
        system: SYSTEM_PROMPT,
        messages: modelMessages,
        abortSignal: req.signal,
      });
      break;
  }

  return result.toUIMessageStreamResponse({
    consumeSseStream: consumeStream,
  });
}
