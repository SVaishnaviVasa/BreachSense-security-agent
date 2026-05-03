import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { 
  parseCommand, 
  getHelpMessage,
  generateBreakAnalysis,
  generateImpactAnalysis,
  generateBreachResponse,
  generateChatResponse,
} from "@/lib/ai/agent";
import { getContext, setTarget } from "@/lib/context/store";

export const maxDuration = 60;

// Stream text response with realistic typing effect
function createStreamedResponse(text: string) {
  return createUIMessageStreamResponse({
    stream: createUIMessageStream({
      async execute({ writer }) {
        const textId = `response-${Date.now()}`;
        writer.write({ type: "text-start", id: textId });
        
        // Stream in chunks for realistic effect
        const chunkSize = 15;
        for (let i = 0; i < text.length; i += chunkSize) {
          writer.write({ type: "text-delta", id: textId, delta: text.slice(i, i + chunkSize) });
          await new Promise(r => setTimeout(r, 8));
        }
        
        writer.write({ type: "text-end", id: textId });
      },
    }),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages || [];
    const targetFromClient: string | undefined = body.target;

    // Update target if provided from client
    if (targetFromClient) {
      setTarget("default", targetFromClient);
    }

    const context = getContext("default");
    
    // Extract last user message
    let lastUserMessage = "";
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.parts && Array.isArray(lastMsg.parts)) {
        lastUserMessage = lastMsg.parts
          .filter((p: { type: string; text?: string }) => p.type === "text")
          .map((p: { text: string }) => p.text)
          .join("");
      } else if (lastMsg.content) {
        lastUserMessage = lastMsg.content;
      }
    }

    const command = parseCommand(lastUserMessage);

    // Handle commands
    switch (command.type) {
      case "help":
        return createStreamedResponse(getHelpMessage());

      case "target":
        if (command.url) {
          setTarget("default", command.url);
          return createStreamedResponse(
            `## Target Updated\n\n**New Target:** \`${command.url}\`\n\nYour target has been set. Now you can:\n\n- \`/break\` - Analyze **${command.url}** for vulnerabilities\n- \`/impact <incident>\` - Check how a breach affects this target\n- \`/breach <type>\` - Get incident response plan\n\n---\n\n**Try it now:** Type \`/break\` to scan for vulnerabilities.`
          );
        }
        return createStreamedResponse("Please provide a URL. Example: `/target https://myapp.com`");

      case "break":
        return createStreamedResponse(generateBreakAnalysis(context.target));

      case "impact":
        return createStreamedResponse(
          generateImpactAnalysis(context.target, command.incident || "security incident")
        );

      case "breach":
        return createStreamedResponse(
          generateBreachResponse(context.target, command.breachType || "data breach")
        );

      case "chat":
      default:
        return createStreamedResponse(generateChatResponse(lastUserMessage, context.target));
    }
  } catch (error) {
    console.error("[v0] Chat API error:", error);
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    
    return createStreamedResponse(
      `## Error\n\n${errorMsg}\n\nPlease try again or use \`/help\` for available commands.`
    );
  }
}
