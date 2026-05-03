import { Chat } from "chat";
import { createSlackAdapter } from "@chat-adapter/slack";
import { createMemoryState } from "@chat-adapter/state-memory";
import { getContext, setTarget } from "@/lib/context/store";
import {
  parseCommand,
  getHelpMessage,
} from "@/lib/ai/agent";
import {
  getDemoAttackSimulation,
  getDemoImpactAnalysis,
  getDemoBreachResponse,
  getDemoGeneralResponse,
} from "@/lib/ai/demo-responses";

// Check if we're in demo mode (no platform tokens)
const hasSlackToken = !!process.env.SLACK_BOT_TOKEN;
const isDemoMode = !hasSlackToken;

// Build adapters based on available credentials
// Note: Discord adapter removed due to native dependency issues in serverless
// Discord support can be added via Discord Interactions API instead
const adapters: Record<string, ReturnType<typeof createSlackAdapter>> = {};

if (hasSlackToken && process.env.SLACK_SIGNING_SECRET) {
  adapters.slack = createSlackAdapter({
    botToken: process.env.SLACK_BOT_TOKEN!,
    signingSecret: process.env.SLACK_SIGNING_SECRET!,
  });
}

// Create the Chat instance
export const bot = new Chat({
  userName: "breachsense",
  adapters,
  state: createMemoryState(),
});

// Handler for when the bot is @mentioned in a new thread
bot.onNewMention(async (thread) => {
  // Subscribe to this thread for future messages
  await thread.subscribe();
  
  // Get the initial message
  const messages: Array<{ role: "user" | "assistant"; content: string }> = [];
  for await (const msg of thread.allMessages) {
    messages.push({
      role: msg.author.isMe ? "assistant" : "user",
      content: msg.text,
    });
  }

  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== "user") {
    await thread.post("Hello! I'm BreachSense, your AI security agent. Type `/help` to see available commands.");
    return;
  }

  await handleBotMessage(thread, lastMessage.content);
});

// Handler for messages in subscribed threads
bot.onSubscribedMessage(async (thread, message) => {
  // Skip messages from the bot itself
  if (message.author.isMe) return;
  
  await handleBotMessage(thread, message.text);
});

// Shared message handler for both onNewMention and onSubscribedMessage
async function handleBotMessage(
  thread: Parameters<Parameters<typeof bot.onNewMention>[0]>[0],
  text: string
) {
  const sessionId = thread.id || "default";
  const command = parseCommand(text);
  const context = getContext(sessionId);

  try {
    switch (command.type) {
      case "target": {
        if (!command.url) {
          await thread.post("Please provide a URL. Example: `/target https://example.com`");
          return;
        }
        const updatedContext = setTarget(sessionId, command.url);
        await thread.post(
          `**Target Registered Successfully**\n\n` +
          `**URL:** ${updatedContext.target}\n` +
          `**Detected Type:** ${updatedContext.type === "web" ? "Web Application" : "API Endpoint"}\n` +
          `**Environment:** ${updatedContext.environment}\n\n` +
          `You can now use \`/break\` to simulate an attack on this target.`
        );
        break;
      }

      case "break": {
        await thread.startTyping();
        const response = getDemoAttackSimulation(context);
        await thread.post(response);
        break;
      }

      case "impact": {
        await thread.startTyping();
        const incident = command.incident || "api key leak";
        const response = getDemoImpactAnalysis(incident, context);
        await thread.post(response);
        break;
      }

      case "breach": {
        await thread.startTyping();
        const breachType = command.breachType || ".env leak";
        const response = getDemoBreachResponse(breachType, context);
        await thread.post(response);
        break;
      }

      case "help": {
        await thread.post(getHelpMessage());
        break;
      }

      case "chat": {
        await thread.startTyping();
        const response = getDemoGeneralResponse(text, context);
        await thread.post(response);
        break;
      }
    }
  } catch (error) {
    console.error("Error handling bot message:", error);
    await thread.post("Sorry, I encountered an error processing your request. Please try again.");
  }
}

// Export demo mode status for UI
export { isDemoMode };
