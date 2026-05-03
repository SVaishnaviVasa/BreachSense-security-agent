import nacl from "tweetnacl";
import { getContext, setTarget } from "@/lib/context/store";
import {
  getDemoAttackSimulation,
  getDemoImpactAnalysis,
  getDemoBreachResponse,
  getDemoHelpMessage,
} from "@/lib/ai/demo-responses";

const DISCORD_PUBLIC_KEY = "392ed7caf36960470ac1b672ea38711562a3a8251ad61d1f0431f17acf5f9652";

// Ed25519 signature verification for Discord
function verifyDiscordSignature(
  body: string,
  signature: string,
  timestamp: string
): boolean {
  try {
    const message = Buffer.from(timestamp + body);
    const sig = Buffer.from(signature, "hex");
    const key = Buffer.from(DISCORD_PUBLIC_KEY, "hex");
    return nacl.sign.detached.verify(message, sig, key);
  } catch (e) {
    console.log("[Discord] Signature verification error:", e);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("x-signature-ed25519");
    const timestamp = req.headers.get("x-signature-timestamp");

    if (!signature || !timestamp) {
      return new Response("Missing signature headers", { status: 401 });
    }

    const body = await req.text();

    // Verify signature using Ed25519
    const isValid = verifyDiscordSignature(body, signature, timestamp);
    if (!isValid) {
      return new Response("Invalid signature", { status: 401 });
    }

    const interaction = JSON.parse(body);

    // Handle PING (type 1) - Discord verification
    if (interaction.type === 1) {
      return new Response(JSON.stringify({ type: 1 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle APPLICATION_COMMAND (type 2)
    if (interaction.type === 2) {
      const commandName = interaction.data?.name || "";
      const options = interaction.data?.options || [];
      const userId = interaction.member?.user?.id || interaction.user?.id || "default";

      const context = getContext(userId);
      let response = "";

      switch (commandName) {
        case "break":
          response = getDemoAttackSimulation(context);
          break;

        case "impact": {
          const incident = options.find((o: { name: string; value?: string }) => o.name === "incident")?.value || "api key leak";
          response = getDemoImpactAnalysis(incident, context);
          break;
        }

        case "breach": {
          const breachType = options.find((o: { name: string; value?: string }) => o.name === "type")?.value || ".env leak";
          response = getDemoBreachResponse(breachType, context);
          break;
        }

        case "target": {
          const url = options.find((o: { name: string; value?: string }) => o.name === "url")?.value;
          if (url && typeof url === "string") {
            setTarget(userId, url);
            response = `**Target Updated**\n\nNew target: \`${url}\`\n\nTry these commands:\n- \`/break\` - Analyze vulnerabilities\n- \`/impact incident:api key leak\`\n- \`/breach type:.env exposed\``;
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

      // Discord has 2000 character limit
      if (response.length > 2000) {
        response = response.substring(0, 1997) + "...";
      }

      return new Response(
        JSON.stringify({
          type: 4,
          data: { content: response },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response("Unsupported interaction type", { status: 400 });
  } catch (error) {
    console.error("[Discord] Error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
