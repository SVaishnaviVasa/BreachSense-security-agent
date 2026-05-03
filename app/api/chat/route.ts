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
import {
  getDemoAttackSimulation,
  getDemoImpactAnalysis,
  getDemoBreachResponse,
} from "@/lib/ai/demo-responses";

export const maxDuration = 30;

// Demo mode is enabled by default when ENABLE_AI_GATEWAY is not set to "true"
// This allows the app to work without a credit card configured on Vercel
const DEMO_MODE = process.env.ENABLE_AI_GATEWAY !== "true";

// Helper to extract text from UIMessage
function getMessageText(message: UIMessage): string {
  if (!message.parts || !Array.isArray(message.parts)) return "";
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text" && typeof p.text === "string")
    .map((p) => p.text)
    .join("");
}

// Create a UIMessage-compatible streaming response for demo mode
// This mimics the exact format that toUIMessageStreamResponse() produces
function createDemoStreamResponse(text: string): Response {
  const encoder = new TextEncoder();
  const messageId = `demo-${Date.now()}`;
  
  const stream = new ReadableStream({
    async start(controller) {
      // Message start event
      const startEvent = {
        type: "start",
        value: {
          messageId,
          role: "assistant",
        }
      };
      controller.enqueue(encoder.encode(`2:${JSON.stringify(startEvent)}\n`));
      
      // Stream text in chunks for a realistic typing effect
      const chunkSize = 50; // characters per chunk
      for (let i = 0; i < text.length; i += chunkSize) {
        const chunk = text.slice(i, i + chunkSize);
        const textEvent = {
          type: "text",
          value: chunk,
        };
        controller.enqueue(encoder.encode(`2:${JSON.stringify(textEvent)}\n`));
        
        // Small delay between chunks for realistic streaming
        await new Promise(resolve => setTimeout(resolve, 30));
      }
      
      // Finish event
      const finishEvent = {
        type: "finish",
        value: {
          finishReason: "stop",
        }
      };
      controller.enqueue(encoder.encode(`2:${JSON.stringify(finishEvent)}\n`));
      
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Vercel-AI-Data-Stream": "v1",
    },
  });
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

    // DEMO MODE: Use pre-built responses when AI Gateway is not available
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

I'm running in demo mode because the AI Gateway is not configured. Here's what you can do:

**Available Commands:**
- \`/break\` - Simulate an attack on the current target
- \`/impact <incident>\` - Analyze impact of a breach (e.g., \`/impact vercel breach\`)
- \`/breach <type>\` - Get incident response guidance (e.g., \`/breach .env leak\`)
- \`/target <url>\` - Set a new target to analyze
- \`/help\` - Show all available commands

**Try These Examples:**
- \`/impact api key leak\`
- \`/breach token exposure\`
- \`/impact oauth compromise\`

*To enable full AI capabilities, set ENABLE_AI_GATEWAY=true in your environment variables and ensure you have a valid credit card on your Vercel account.*`;
          break;
      }

      return createDemoStreamResponse(responseText);
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
    
    // If AI Gateway fails, fall back to demo mode response
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    const fallbackText = `**Error Occurred**

${errorMessage.includes("credit card") ? "The AI Gateway requires a valid credit card to be configured on your Vercel account." : `An error occurred: ${errorMessage}`}

**BreachSense is running in Demo Mode!**

You can still use all features with realistic simulated responses:
- \`/break\` - Attack simulation
- \`/impact <incident>\` - Breach impact analysis  
- \`/breach <type>\` - Incident response guidance

Try running \`/break\` to see the demo attack simulation!`;

    return createDemoStreamResponse(fallbackText);
  }
}
