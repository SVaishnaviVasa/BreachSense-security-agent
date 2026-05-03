import { streamText, createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { 
  xai, 
  SYSTEM_PROMPT, 
  parseCommand, 
  getHelpMessage,
  createBreakPrompt,
  createImpactPrompt,
  createBreachPrompt,
} from "@/lib/ai/agent";
import { getContext, setTarget } from "@/lib/context/store";

export const maxDuration = 60;

// Helper to create a simple streamed response
function createStreamedResponse(text: string) {
  return createUIMessageStreamResponse({
    stream: createUIMessageStream({
      async execute({ writer }) {
        const textId = `response-${Date.now()}`;
        writer.write({ type: "text-start", id: textId });
        
        // Stream in chunks
        const chunkSize = 20;
        for (let i = 0; i < text.length; i += chunkSize) {
          writer.write({ type: "text-delta", id: textId, delta: text.slice(i, i + chunkSize) });
          await new Promise(r => setTimeout(r, 5));
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

    // Update target if provided
    if (targetFromClient) {
      setTarget("default", targetFromClient);
    }

    const context = getContext("default");
    
    // Get last user message
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

    // Handle /help locally (no AI needed)
    if (command.type === "help") {
      return createStreamedResponse(getHelpMessage());
    }

    // Handle /target locally (no AI needed)
    if (command.type === "target" && command.url) {
      setTarget("default", command.url);
      return createStreamedResponse(`## Target Updated\n\n**New Target:** \`${command.url}\`\n\nNow you can use:\n- \`/break\` - Analyze this target for vulnerabilities\n- \`/impact <incident>\` - Check how a breach affects this target\n- \`/breach <type>\` - Get incident response for this target`);
    }

    // Build the prompt based on command type
    let userPrompt = lastUserMessage;
    
    if (command.type === "break") {
      userPrompt = createBreakPrompt(context.target);
    } else if (command.type === "impact") {
      userPrompt = createImpactPrompt(context.target, command.incident || "security incident");
    } else if (command.type === "breach") {
      userPrompt = createBreachPrompt(context.target, command.breachType || "data breach");
    }

    // Use Grok AI for analysis
    const result = streamText({
      model: xai("grok-2-1212"),
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    // Convert to UI message stream response
    return createUIMessageStreamResponse({
      stream: createUIMessageStream({
        async execute({ writer }) {
          const textId = `ai-${Date.now()}`;
          writer.write({ type: "text-start", id: textId });
          
          const textStream = result.textStream;
          for await (const chunk of textStream) {
            writer.write({ type: "text-delta", id: textId, delta: chunk });
          }
          
          writer.write({ type: "text-end", id: textId });
        },
      }),
    });
  } catch (error) {
    console.error("[v0] Chat API error:", error);
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    
    return createUIMessageStreamResponse({
      stream: createUIMessageStream({
        async execute({ writer }) {
          const textId = `error-${Date.now()}`;
          writer.write({ type: "text-start", id: textId });
          writer.write({ type: "text-delta", id: textId, delta: `**Error:** ${errorMsg}\n\nPlease try again or use \`/help\` for available commands.` });
          writer.write({ type: "text-end", id: textId });
        },
      }),
    });
  }
}
