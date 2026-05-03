import {
  UIMessage,
  createUIMessageStream,
  createUIMessageStreamResponse,
} from "ai";
import { parseCommand } from "@/lib/ai/agent";
import { getContext } from "@/lib/context/store";
import {
  getDemoAttackSimulation,
  getDemoImpactAnalysis,
  getDemoBreachResponse,
  getDemoHelpMessage,
  getDemoGeneralResponse,
} from "@/lib/ai/demo-responses";

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

    // Get the appropriate response based on command
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
      case "chat":
      default:
        responseText = getDemoGeneralResponse(lastMessageText, context);
        break;
    }

    // Create a proper UI message stream
    return createUIMessageStreamResponse({
      stream: createUIMessageStream({
        async execute({ writer }) {
          const textId = `response-${Date.now()}`;
          
          // Start the text block
          writer.write({
            type: "text-start",
            id: textId,
          });

          // Stream the text in chunks for realistic effect
          const chunkSize = 15;
          for (let i = 0; i < responseText.length; i += chunkSize) {
            const chunk = responseText.slice(i, i + chunkSize);
            writer.write({
              type: "text-delta",
              id: textId,
              delta: chunk,
            });
            // Small delay for streaming effect
            await new Promise((resolve) => setTimeout(resolve, 8));
          }

          // End the text block
          writer.write({
            type: "text-end",
            id: textId,
          });
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
          const fallbackText = `**Error Processing Request**

${errorMessage}

Please try one of these commands:
- \`/break\` - Attack simulation
- \`/impact api key leak\` - Breach impact analysis  
- \`/breach .env leak\` - Incident response guidance
- \`/help\` - Show all commands`;

          writer.write({ type: "text-start", id: textId });
          writer.write({ type: "text-delta", id: textId, delta: fallbackText });
          writer.write({ type: "text-end", id: textId });
        },
      }),
    });
  }
}
