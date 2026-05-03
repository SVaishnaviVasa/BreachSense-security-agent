import type { ProjectContext } from "@/lib/context/store";

export const SYSTEM_PROMPT = `You are BreachSense, an AI-powered security agent that helps teams identify vulnerabilities and respond to security incidents. You are knowledgeable, precise, and provide actionable security advice.

Your capabilities:
1. Simulate attacks on web applications and APIs
2. Analyze the impact of real-world security breaches
3. Provide incident response guidance

Always respond in a structured, professional manner. Use clear formatting with headers, bullet points, and severity indicators.

Severity indicators:
- 🔴 High/Critical - Immediate action required
- 🟡 Medium - Should be addressed soon
- 🟢 Low - Monitor and address when possible

When analyzing security issues, always consider:
- Attack vectors and exploit chains
- Data exposure risks
- Business impact
- Remediation steps`;

export function createAttackSimulationPrompt(context: ProjectContext): string {
  return `Simulate a security attack on the following target:

Target: ${context.target}
Type: ${context.type === "web" ? "Web Application" : "API Endpoint"}
Environment: ${context.environment}

Analyze potential vulnerabilities and create a realistic attack simulation. Consider common vulnerabilities like:
- SQL Injection
- Cross-Site Scripting (XSS)
- Authentication bypass
- Authorization flaws
- API security issues
- Information disclosure

Respond in this exact format:

**🎯 Attack Simulation Report**

**Target:** ${context.target}
**Type:** ${context.type === "web" ? "Web Application" : "API"}

**🔓 Vulnerabilities Discovered:**
[List 3-5 potential vulnerabilities with severity levels]

**⛓️ Attack Chain:**
[Step-by-step attack sequence, numbered 1-5]

**📊 Confidence Level:** [High/Medium/Low]

**🛡️ Immediate Recommendations:**
[3-4 actionable recommendations]`;
}

export function createImpactAnalysisPrompt(
  incident: string,
  context: ProjectContext
): string {
  const incidentDescriptions: Record<string, string> = {
    "vercel breach": "A breach similar to the Vercel security incident where internal systems were compromised, potentially exposing customer deployment configurations, environment variables, and source code access tokens.",
    "api key leak": "API keys or secret tokens have been accidentally exposed in public repositories, logs, or client-side code, potentially allowing unauthorized access to backend services.",
    "oauth compromise": "OAuth tokens or authentication provider credentials have been compromised, potentially allowing attackers to impersonate users or access protected resources.",
  };

  const description = incidentDescriptions[incident.toLowerCase()] || 
    `A security incident involving: ${incident}`;

  return `Analyze the impact of the following security incident on the current project:

**Incident Type:** ${incident}
**Description:** ${description}

**Current Project Context:**
- Target: ${context.target}
- Type: ${context.type}
- Environment: ${context.environment}

Analyze how this incident would affect the project and provide a detailed impact assessment.

Respond in this exact format:

**🌐 Global Breach Impact Analysis**

**Incident:** ${incident}

**💥 Impact Assessment:**
[Detailed analysis of how this breach affects the project, 3-4 bullet points]

**⚠️ Risk Level:** [Critical/High/Medium/Low] [Use appropriate emoji: 🔴/🟡/🟢]

**🎯 Affected Systems:**
[List specific systems, services, or components that would be affected]

**🔐 Immediate Actions Required:**
[4-5 specific, actionable steps to mitigate the impact]

**📋 Long-term Recommendations:**
[2-3 strategic recommendations for preventing similar incidents]`;
}

export function createBreachResponsePrompt(
  breachType: string,
  context: ProjectContext
): string {
  const breachScenarios: Record<string, string> = {
    ".env leak": "Environment variables file (.env) containing secrets, API keys, database credentials, and configuration has been exposed publicly.",
    "token exposure": "Authentication tokens, JWT secrets, or session tokens have been exposed, potentially allowing session hijacking or unauthorized access.",
    "database leak": "Database credentials or direct database access has been compromised, potentially exposing all stored data.",
    "source code leak": "Source code has been exposed, revealing application logic, security implementations, and potentially hardcoded secrets.",
  };

  const scenario = breachScenarios[breachType.toLowerCase()] ||
    `Security breach involving: ${breachType}`;

  return `Provide an incident response plan for the following internal breach:

**Breach Type:** ${breachType}
**Scenario:** ${scenario}

**Project Context:**
- Target: ${context.target}
- Environment: ${context.environment}

Generate a comprehensive breach response plan.

Respond in this exact format:

**🚨 Breach Response Plan**

**Breach Type:** ${breachType}

**🔍 Exposure Analysis:**
[What exactly is exposed and how it could be exploited, 3-4 bullet points]

**💀 Potential Attacker Actions:**
[What an attacker could do with this access, 3-4 bullet points]

**🛡️ Immediate Actions (First 1 Hour):**
[Numbered list of 4-5 urgent steps]

**📋 Short-term Actions (24-48 Hours):**
[Numbered list of 3-4 follow-up steps]

**🔒 Prevention Measures:**
[3-4 measures to prevent future occurrences]

**✅ Recovery Checklist:**
[Numbered checklist of 5-6 items to verify after incident resolution]`;
}
