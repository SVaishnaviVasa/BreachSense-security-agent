import {
  UIMessage,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  convertToModelMessages,
} from "ai";
import { parseCommand, grokModel, SYSTEM_PROMPT } from "@/lib/ai/agent";
import { getContext, setTarget } from "@/lib/context/store";
import {
  getDemoAttackSimulation,
  getDemoImpactAnalysis,
  getDemoBreachResponse,
  getDemoHelpMessage,
  getDemoGeneralResponse,
} from "@/lib/ai/demo-responses";

export const maxDuration = 30;

// Check if Grok AI is available
const USE_AI = !!grokModel;

// Helper to extract text from UIMessage
function getMessageText(message: UIMessage): string {
  if (!message.parts || !Array.isArray(message.parts)) return "";
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text" && typeof p.text === "string")
    .map((p) => p.text)
    .join("");
}

export async function POST(req: Request) {
  try {
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

    // Use AI if available for general chat
    if (USE_AI && grokModel && command.type === "chat") {
      const conversationMessages = await convertToModelMessages(messages);
      const result = streamText({
        model: grokModel,
        system: SYSTEM_PROMPT,
        messages: conversationMessages,
      });

      return result.toUIMessageStreamResponse();
    }

    // Use AI for command-based queries if available
    if (USE_AI && grokModel && ["break", "impact", "breach"].includes(command.type)) {
      const systemPrompt =
        command.type === "break"
          ? `${SYSTEM_PROMPT}\n\nThe user wants an attack simulation on ${context.target}. Provide a detailed, realistic attack chain with specific payloads and vulnerabilities.`
          : command.type === "impact"
            ? `${SYSTEM_PROMPT}\n\nAnalyze how this breach impacts ${context.target}: ${command.incident || "API key leak"}`
            : `${SYSTEM_PROMPT}\n\nProvide incident response guidance for ${command.breachType || "internal breach"} affecting ${context.target}`;

      const result = streamText({
        model: grokModel,
        system: systemPrompt,
        messages: [{ role: "user", content: lastMessageText }],
      });

      return result.toUIMessageStreamResponse();
    }

    // Fall back to demo mode
    let responseText: string;

    switch (command.type) {
      case "break":
        responseText = getDemoAttackSimulation(context);
        break;
      case "impact":
        responseText = getDemoImpactAnalysis(command.incident || "api key leak", context);
        break;
      case "breach":
        responseText = getDemoBreachResponse(command.breachType || ".env leak", context);
        break;
      case "help":
        responseText = getDemoHelpMessage();
        break;
      case "target":
        if (command.url) {
          setTarget("default", command.url);
        }
        responseText = `Target: ${command.url || context.target}`;
        break;
      case "chat":
      default:
        responseText = getDemoGeneralResponse(lastMessageText, context);
        break;
    }

    // Stream demo response
    return createUIMessageStreamResponse({
      stream: createUIMessageStream({
        async execute({ writer }) {
          const textId = `response-${Date.now()}`;
          writer.write({ type: "text-start", id: textId });

          // Stream in chunks for realistic effect
          const chunkSize = 15;
          for (let i = 0; i < responseText.length; i += chunkSize) {
            const chunk = responseText.slice(i, i + chunkSize);
            writer.write({ type: "text-delta", id: textId, delta: chunk });
            await new Promise((resolve) => setTimeout(resolve, 8));
          }

          writer.write({ type: "text-end", id: textId });
        },
      }),
    });
  } catch (error: unknown) {
    console.error("[v0] Chat API error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return createUIMessageStreamResponse({
      stream: createUIMessageStream({
        async execute({ writer }) {
          const textId = `error-${Date.now()}`;
          const fallbackText = `**Error Processing Request**\n\n${errorMessage}\n\nTry: \`/break\`, \`/help\`, or \`/target <url>\``;
          writer.write({ type: "text-start", id: textId });
          writer.write({ type: "text-delta", id: textId, delta: fallbackText });
          writer.write({ type: "text-end", id: textId });
        },
      }),
    });
  }
}
