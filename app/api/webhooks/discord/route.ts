import { verifyKey } from "discord-interactions";
import { getContext, setTarget } from "@/lib/context/store";
import { parseCommand } from "@/lib/ai/agent";
import {
  getDemoAttackSimulation,
  getDemoImpactAnalysis,
  getDemoBreachResponse,
  getDemoGeneralResponse,
  getDemoHelpMessage,
} from "@/lib/ai/demo-responses";

const DISCORD_PUBLIC_KEY = "392ed7caf36960470ac1b672ea38711562a3a8251ad61d1f0431f17acf5f9652";
const DISCORD_BOT_TOKEN = "MTUwMDQwMDM3MjE5MDI4MTkyOQ.Gwytui._3wlng4uZuw_aSyk61TlFB88klrouyifGLQs2g";

interface DiscordMessage {
  type: number;
  token?: string;
  interaction_token?: string;
  data?: Record<string, unknown>;
}

export async function POST(req: Request) {
  // Verify Discord signature
  const signature = req.headers.get("x-signature-ed25519");
  const timestamp = req.headers.get("x-signature-timestamp");

  if (!signature || !timestamp) {
    return new Response("Missing signature headers", { status: 401 });
  }

  const body = await req.text();

  if (!DISCORD_PUBLIC_KEY) {
    console.error("Discord public key not configured");
    return new Response("Discord not configured", { status: 500 });
  }

  const isValidRequest = verifyKey(body, signature, timestamp, DISCORD_PUBLIC_KEY);

  if (!isValidRequest) {
    return new Response("Invalid request signature", { status: 401 });
  }

  const message: DiscordMessage = JSON.parse(body);

  // Handle PING
  if (message.type === 1) {
    return new Response(JSON.stringify({ type: 1 }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Handle APPLICATION_COMMAND
  if (message.type === 2) {
    const interaction = message as DiscordMessage & {
      data: {
        name: string;
        options?: Array<{ name: string; value: string }>;
      };
    };
    const command = interaction.data?.name || "";
    const options = interaction.data?.options || [];

    const sessionId = (message as any).member?.user?.id || "default";
    const context = getContext(sessionId);

    let response = "";

    try {
      switch (command) {
        case "break":
          response = getDemoAttackSimulation(context);
          break;
        case "impact": {
          const incident = options.find((o) => o.name === "incident")?.value || "api key leak";
          response = getDemoImpactAnalysis(incident as string, context);
          break;
        }
        case "breach": {
          const breachType = options.find((o) => o.name === "type")?.value || ".env leak";
          response = getDemoBreachResponse(breachType as string, context);
          break;
        }
        case "target": {
          const url = options.find((o) => o.name === "url")?.value;
          if (url) {
            setTarget(sessionId, url as string);
            response = `Target updated to: **${url}**`;
          } else {
            response = "Please provide a URL for the target.";
          }
          break;
        }
        case "help":
          response = getDemoHelpMessage();
          break;
        default:
          response = "Unknown command. Type `/help` for available commands.";
      }
    } catch (error) {
      console.error("Error processing Discord command:", error);
      response = "An error occurred processing your request.";
    }

    // Send deferred response
    return new Response(
      JSON.stringify({
        type: 4,
        data: {
          content: response.substring(0, 2000), // Discord has 2000 char limit
        },
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new Response("Unhandled interaction type", { status: 400 });
}
