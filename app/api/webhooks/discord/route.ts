import { createHmac } from "crypto";
import { getContext, setTarget } from "@/lib/context/store";
import {
  getDemoAttackSimulation,
  getDemoImpactAnalysis,
  getDemoBreachResponse,
  getDemoHelpMessage,
} from "@/lib/ai/demo-responses";

const DISCORD_PUBLIC_KEY = "392ed7caf36960470ac1b672ea38711562a3a8251ad61d1f0431f17acf5f9652";

// Manual signature verification for Discord
function verifyDiscordSignature(
  body: string,
  signature: string,
  timestamp: string
): boolean {
  try {
    const message = timestamp + body;
    const hash = createHmac("sha256", Buffer.from(DISCORD_PUBLIC_KEY, "hex"))
      .update(message)
      .digest("hex");
    return hash === signature;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("x-signature-ed25519");
    const timestamp = req.headers.get("x-signature-timestamp");

    if (!signature || !timestamp) {
      console.log("[Discord] Missing signature or timestamp");
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.text();

    // Verify signature
    if (!verifyDiscordSignature(body, signature, timestamp)) {
      console.log("[Discord] Invalid signature");
      return new Response("Unauthorized", { status: 401 });
    }

    const interaction = JSON.parse(body);

    // Handle PING - this is what Discord sends for verification
    if (interaction.type === 1) {
      console.log("[Discord] PING received - responding with PONG");
      return new Response(JSON.stringify({ type: 1 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle slash commands
    if (interaction.type === 2) {
      const commandName = interaction.data?.name || "";
      const options = interaction.data?.options || [];
      const userId = interaction.member?.user?.id || interaction.user?.id || "default";

      console.log(`[Discord] Command: ${commandName} from ${userId}`);

      const context = getContext(userId);
      let response = "";

      switch (commandName) {
        case "break":
          response = getDemoAttackSimulation(context);
          break;

        case "impact": {
          const incident =
            options.find((o: any) => o.name === "incident")?.value || "api key leak";
          response = getDemoImpactAnalysis(incident, context);
          break;
        }

        case "breach": {
          const breachType = options.find((o: any) => o.name === "type")?.value || ".env leak";
          response = getDemoBreachResponse(breachType, context);
          break;
        }

        case "target": {
          const url = options.find((o: any) => o.name === "url")?.value;
          if (url && typeof url === "string") {
            setTarget(userId, url);
            response = `**Target Updated** to: \`${url}\`\n\nNow try:\n- /break - Analyze for vulnerabilities\n- /impact incident:api key leak\n- /breach type:.env exposed`;
          } else {
            response = "Please provide a valid URL.";
          }
          break;
        }

        case "help":
          response = getDemoHelpMessage();
          break;

        default:
          response = `Unknown command: ${commandName}. Use /help for available commands.`;
      }

      // Truncate to Discord's 2000 character limit
      const truncatedResponse = response.substring(0, 2000);

      return new Response(
        JSON.stringify({
          type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
          data: {
            content: truncatedResponse,
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[Discord] Unhandled interaction type: ${interaction.type}`);
    return new Response("Unsupported interaction type", { status: 400 });
  } catch (error) {
    console.error("[Discord] Error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
