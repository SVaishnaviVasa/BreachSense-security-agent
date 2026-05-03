import {
  UIMessage,
  createUIMessageStream,
  createUIMessageStreamResponse,
} from "ai";
import { parseCommand } from "@/lib/ai/agent";
import { getContext, setTarget } from "@/lib/context/store";
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
    const body = await req.json();
    const messages: UIMessage[] = body.messages;
    const targetFromClient: string | undefined = body.target;

    if (!messages || messages.length === 0) {
      return new Response("No messages provided", { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "user") {
      return new Response("No user message provided", { status: 400 });
    }

    const lastMessageText = getMessageText(lastMessage);
    const command = parseCommand(lastMessageText);
    
    // Use target from client if provided, otherwise use server context
    let context = getContext("default");
    if (targetFromClient) {
      setTarget("default", targetFromClient);
      context = getContext("default");
    }

    // Get response based on command
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
