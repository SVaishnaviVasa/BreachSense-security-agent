import { NextResponse } from "next/server";

export async function GET() {
  const hasSlackToken = !!process.env.SLACK_BOT_TOKEN;
  const hasDiscordToken = !!process.env.DISCORD_BOT_TOKEN;
  const hasAiGateway = !!process.env.AI_GATEWAY_API_KEY;
  
  return NextResponse.json({
    status: "ok",
    mode: hasSlackToken || hasDiscordToken ? "connected" : "demo",
    platforms: {
      web: true,
      slack: hasSlackToken,
      discord: hasDiscordToken,
    },
    ai: {
      configured: true, // AI Gateway works without API key in v0
      gateway: hasAiGateway ? "custom" : "default",
    },
  });
}
