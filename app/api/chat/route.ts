import {
  streamText,
  convertToModelMessages,
  UIMessage,
  consumeStream,
  createUIMessageStream,
  createUIMessageStreamResponse,
} from "ai";
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
import {
  getDemoAttackSimulation,
  getDemoImpactAnalysis,
  getDemoBreachResponse,
} from "@/lib/ai/demo-responses";

export const maxDuration = 30;

// Demo mode is enabled by default when ENABLE_AI_GATEWAY is not set to "true"
const DEMO_MODE = process.env.ENABLE_AI_GATEWAY !== "true";

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

    // DEMO MODE: Use pre-built responses
    if (DEMO_MODE) {
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
        case "chat":
        default:
          responseText = `**BreachSense Demo Mode**

I'm running in demo mode. Here's what you can do:

**Available Commands:**
- \`/break\` - Simulate an attack on the current target
- \`/impact <incident>\` - Analyze impact of a breach (e.g., \`/impact vercel breach\`)
- \`/breach <type>\` - Get incident response guidance (e.g., \`/breach .env leak\`)
- \`/target <url>\` - Set a new target to analyze
- \`/help\` - Show all available commands

**Try These Examples:**
- \`/break\` - Run attack simulation
- \`/impact api key leak\` - API key exposure analysis
- \`/breach token exposure\` - Token breach response plan`;
          break;
      }

      // Create a proper UI message stream for demo mode
      return createUIMessageStreamResponse({
        stream: createUIMessageStream({
          async execute({ writer }) {
            const textId = `demo-text-${Date.now()}`;
            
            // Start the text block
            writer.write({
              type: "text-start",
              id: textId,
            });

            // Stream the text character by character for realistic effect
            const chunkSize = 20;
            for (let i = 0; i < responseText.length; i += chunkSize) {
              const chunk = responseText.slice(i, i + chunkSize);
              writer.write({
                type: "text-delta",
                id: textId,
                delta: chunk,
              });
              // Small delay for streaming effect
              await new Promise((resolve) => setTimeout(resolve, 10));
            }

            // End the text block
            writer.write({
              type: "text-end",
              id: textId,
            });
          },
        }),
      });
    }

    // PRODUCTION MODE: Use AI Gateway
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
  } catch (error: unknown) {
    console.error("[v0] Chat API error:", error);

    // If AI Gateway fails, return a demo response
    const errorMessage = error instanceof Error ? error.message : String(error);

    return createUIMessageStreamResponse({
      stream: createUIMessageStream({
        async execute({ writer }) {
          const textId = `error-text-${Date.now()}`;
          const fallbackText = `**Error Occurred**

${errorMessage.includes("credit card") ? "The AI Gateway requires a valid credit card." : `Error: ${errorMessage}`}

**BreachSense is running in Demo Mode!**

Try these commands:
- \`/break\` - Attack simulation
- \`/impact api key leak\` - Breach impact analysis
- \`/breach .env leak\` - Incident response guidance`;

          writer.write({ type: "text-start", id: textId });
          writer.write({ type: "text-delta", id: textId, delta: fallbackText });
          writer.write({ type: "text-end", id: textId });
        },
      }),
    });
  }
}
