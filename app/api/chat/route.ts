import { streamText } from "ai";
import {
  MODEL,
  SYSTEM_PROMPT,
  parseCommand,
  getHelpMessage,
} from "@/lib/ai/agent";
import {
  createAttackSimulationPrompt,
  createImpactAnalysisPrompt,
  createBreachResponsePrompt,
} from "@/lib/ai/prompts";
import { getContext, setTarget } from "@/lib/context/store";

export async function POST(req: Request) {
  const { messages, sessionId = "default" } = await req.json();
  
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== "user") {
    return new Response("No user message provided", { status: 400 });
  }

  const command = parseCommand(lastMessage.content);
  const context = getContext(sessionId);

  // Handle non-streaming commands
  if (command.type === "target") {
    if (!command.url) {
      return new Response(
        JSON.stringify({
          role: "assistant",
          content: "Please provide a URL. Example: `/target https://example.com`",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }
    const updatedContext = setTarget(sessionId, command.url);
    const responseText = `**Target Registered Successfully**

**URL:** ${updatedContext.target}
**Detected Type:** ${updatedContext.type === "web" ? "Web Application" : "API Endpoint"}
**Environment:** ${updatedContext.environment}

You can now use \`/break\` to simulate an attack on this target.`;
    
    // Return as a simple text stream for consistency
    const result = streamText({
      model: MODEL,
      system: "You are a helpful assistant.",
      prompt: `Respond with exactly this text, no changes: ${responseText}`,
    });
    return result.toDataStreamResponse();
  }

  if (command.type === "help") {
    const helpText = getHelpMessage();
    const result = streamText({
      model: MODEL,
      system: "You are a helpful assistant.",
      prompt: `Respond with exactly this text, no changes:\n\n${helpText}`,
    });
    return result.toDataStreamResponse();
  }

  // Handle streaming commands
  let result;

  switch (command.type) {
    case "break":
      result = streamText({
        model: MODEL,
        system: SYSTEM_PROMPT,
        prompt: createAttackSimulationPrompt(context),
      });
      break;

    case "impact":
      result = streamText({
        model: MODEL,
        system: SYSTEM_PROMPT,
        prompt: createImpactAnalysisPrompt(command.incident || "api key leak", context),
      });
      break;

    case "breach":
      result = streamText({
        model: MODEL,
        system: SYSTEM_PROMPT,
        prompt: createBreachResponsePrompt(command.breachType || ".env leak", context),
      });
      break;

    case "chat":
    default:
      result = streamText({
        model: MODEL,
        system: SYSTEM_PROMPT,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      });
      break;
  }

  return result.toDataStreamResponse();
}
