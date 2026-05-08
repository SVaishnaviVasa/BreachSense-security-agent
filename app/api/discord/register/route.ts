const DISCORD_BOT_TOKEN = <DISCORD_BOT_TOKEN>;
const DISCORD_APP_ID = <DISCORD_APP_ID>;

const commands = [
  {
    name: "break",
    description: "Simulate an attack on the current target",
  },
  {
    name: "impact",
    description: "Analyze how a breach impacts your system",
    options: [
      {
        name: "incident",
        description: "Type of incident (e.g., 'vercel breach', 'api key leak')",
        type: 3, // STRING
        required: true,
      },
    ],
  },
  {
    name: "breach",
    description: "Get incident response guidance",
    options: [
      {
        name: "type",
        description: "Type of breach (e.g., '.env leak', 'token exposure')",
        type: 3, // STRING
        required: true,
      },
    ],
  },
  {
    name: "target",
    description: "Set target application URL",
    options: [
      {
        name: "url",
        description: "Target URL to analyze",
        type: 3, // STRING
        required: true,
      },
    ],
  },
  {
    name: "help",
    description: "Show available BreachSense commands",
  },
];

export async function GET() {
  try {
    const response = await fetch(
      `https://discord.com/api/v10/applications/${DISCORD_APP_ID}/commands`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commands),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return new Response(`Failed to register commands: ${error}`, { status: 500 });
    }

    const data = await response.json();
    return new Response(
      JSON.stringify({ success: true, commands: data }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(`Error: ${error}`, { status: 500 });
  }
}
