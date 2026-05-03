import { createXai } from "@ai-sdk/xai";

// Grok AI Configuration
const XAI_API_KEY = "xai-HSfIe7jmN6zVanDWTqk0XAF4SIfWnJwCjtAhRof0ErbnPFiIBZVuMkDaRTYm1JzX7QfuTz9GBuAJ9Ee0";

export const xai = createXai({
  apiKey: XAI_API_KEY,
});

// System prompt for BreachSense
export const SYSTEM_PROMPT = `You are BreachSense, an elite AI security analyst. You analyze websites and applications for vulnerabilities.

When given a target URL:
1. Analyze the domain and technology stack (Vercel, AWS, Next.js, React, Node.js, etc.)
2. Identify potential vulnerabilities specific to that stack
3. Provide realistic attack vectors and payloads
4. Rate severity: **CRITICAL**, **HIGH**, **MEDIUM**, **LOW**
5. Give specific remediation steps

Always format responses with:
- Markdown headers and tables
- Code blocks for payloads/commands
- Specific details about the target URL provided

Never give generic responses - always analyze the specific target.`;

// Command types
export type Command = 
  | { type: "target"; url: string }
  | { type: "break" }
  | { type: "impact"; incident: string }
  | { type: "breach"; breachType: string }
  | { type: "help" }
  | { type: "chat"; message: string };

export function parseCommand(text: string): Command {
  const trimmed = text.trim();
  
  if (trimmed.startsWith("/target")) {
    const url = trimmed.replace("/target", "").trim();
    return { type: "target", url };
  }
  
  if (trimmed.startsWith("/break")) {
    return { type: "break" };
  }
  
  if (trimmed.startsWith("/impact")) {
    const incident = trimmed.replace("/impact", "").trim();
    return { type: "impact", incident };
  }
  
  if (trimmed.startsWith("/breach")) {
    const breachType = trimmed.replace("/breach", "").trim();
    return { type: "breach", breachType };
  }
  
  if (trimmed.startsWith("/help")) {
    return { type: "help" };
  }
  
  return { type: "chat", message: trimmed };
}

export function getHelpMessage(): string {
  return `## BreachSense Commands

| Command | Description | Example |
|---------|-------------|---------|
| \`/target <url>\` | Set target website or API | \`/target https://myapp.com\` |
| \`/break\` | Analyze target for vulnerabilities | \`/break\` |
| \`/impact <incident>\` | Analyze breach impact | \`/impact api key leaked\` |
| \`/breach <type>\` | Get incident response | \`/breach .env exposed\` |
| \`/help\` | Show this help | \`/help\` |

**How to use:**
1. First set your target: \`/target https://your-website.com\`
2. Then analyze it: \`/break\`
3. Or check impact: \`/impact database credentials leaked\``;
}

export function createBreakPrompt(target: string): string {
  return `Analyze this target URL for security vulnerabilities: ${target}

Provide a detailed security assessment:

## Target Analysis
- URL: ${target}
- Identify the technology stack from the URL/domain
- List attack surface areas

## Vulnerabilities Found
Create a table:
| Vulnerability | Severity | Location | Risk |
|--------------|----------|----------|------|

## Attack Vectors
For each vulnerability:
1. How to exploit it
2. Example payload (in code block)
3. Potential impact

## Proof of Concept
Provide curl commands or code to test the vulnerabilities.

## Remediation
Priority fixes with code examples.

Be SPECIFIC to ${target}. Analyze the domain name, any paths, and infer the likely tech stack.`;
}

export function createImpactPrompt(target: string, incident: string): string {
  return `Analyze how this incident affects the target system:

**Target:** ${target}
**Incident:** ${incident}

Provide:

## Impact Assessment
- Severity rating (CRITICAL/HIGH/MEDIUM/LOW)
- What systems/data are affected

## Affected Components
| Component | Risk Level | Data at Risk | Immediate Action |
|-----------|------------|--------------|------------------|

## Timeline
- How fast can this be exploited?
- Time to potential damage

## Immediate Actions (Priority Order)
1. [ ] First action (deadline)
2. [ ] Second action (deadline)
3. [ ] Third action (deadline)

## Long-term Fixes
What to implement to prevent this.

Be specific to ${target} and the incident "${incident}".`;
}

export function createBreachPrompt(target: string, breachType: string): string {
  return `Incident response for this breach:

**System:** ${target}
**Breach:** ${breachType}

## Severity Assessment
Rate: CRITICAL / HIGH / MEDIUM / LOW

## Immediate Response (First 15 min)
Step-by-step actions with commands.

## Containment
How to stop the damage.

## Investigation
- Logs to check
- Evidence to collect

## Recovery
- Services to restore
- Credentials to rotate
- Code to deploy

## Post-Incident
- Documentation
- Prevention measures

Be specific to ${target} and "${breachType}".`;
}
