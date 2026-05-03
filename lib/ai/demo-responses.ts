import type { ProjectContext } from "@/lib/context/store";

// Demo mode responses that are contextual to the target application
// These analyze how global breaches would specifically impact the user's target system

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function inferTechStack(url: string): string[] {
  const domain = url.toLowerCase();
  const stack: string[] = [];
  
  // Infer based on common patterns
  if (domain.includes("vercel") || domain.includes(".app")) {
    stack.push("Vercel", "Next.js", "Node.js");
  }
  if (domain.includes("netlify")) {
    stack.push("Netlify", "Jamstack");
  }
  if (domain.includes("herokuapp") || domain.includes("heroku")) {
    stack.push("Heroku", "Node.js/Python");
  }
  if (domain.includes("aws") || domain.includes("amazonaws")) {
    stack.push("AWS", "Lambda", "S3");
  }
  if (domain.includes("azure")) {
    stack.push("Azure", "Azure Functions");
  }
  if (domain.includes("juice-shop") || domain.includes("owasp")) {
    stack.push("Node.js", "Express", "SQLite", "Angular");
  }
  if (domain.includes("api") || domain.includes("/v1") || domain.includes("/v2")) {
    stack.push("REST API");
  }
  
  // Default tech stack if nothing specific detected
  if (stack.length === 0) {
    stack.push("Web Application", "Database", "Authentication Service");
  }
  
  return stack;
}

export function getDemoAttackSimulation(context: ProjectContext): string {
  const domain = extractDomain(context.target);
  const techStack = inferTechStack(context.target);
  const isJuiceShop = context.target.includes("juice-shop") || context.target.includes("owasp");
  
  if (isJuiceShop) {
    return `## Attack Simulation Report

**Target:** ${context.target}
**Domain:** ${domain}
**Type:** ${context.type === "web" ? "Web Application" : "API Endpoint"}
**Detected Stack:** ${techStack.join(", ")}

---

### Vulnerabilities Discovered

| Severity | Vulnerability | Location | Status |
|----------|--------------|----------|--------|
| CRITICAL | SQL Injection | \`/rest/user/login\` | Exploitable |
| CRITICAL | Cross-Site Scripting (XSS) | \`/#/search\`, \`/api/Feedbacks\` | Exploitable |
| HIGH | Broken Access Control | \`/#/administration\` | Exploitable |
| HIGH | Sensitive Data Exposure | \`/api/Users\` | Confirmed |
| MEDIUM | Security Misconfiguration | Error handling | Confirmed |

---

### Attack Chain

\`\`\`
1. RECONNAISSANCE
   └─> Discovered /api-docs and /ftp endpoints
   └─> Enumerated 47 API endpoints
   
2. INITIAL ACCESS  
   └─> SQL Injection: admin'-- bypassed authentication
   └─> Gained admin session token
   
3. PRIVILEGE ESCALATION
   └─> Accessed /#/administration panel
   └─> Modified user roles in database
   
4. DATA EXFILTRATION
   └─> Dumped user table via /api/Users
   └─> Extracted 1,247 user records
   
5. PERSISTENCE
   └─> Created backdoor admin account
   └─> Planted XSS payload in product reviews
\`\`\`

---

### Impact Assessment

- **User Data at Risk:** Email addresses, password hashes, purchase history
- **Financial Impact:** Potential payment data exposure via order history
- **Compliance:** GDPR/CCPA violations likely
- **Reputation:** Public disclosure would severely damage trust

---

### Immediate Remediation

1. **Parameterize all SQL queries** - Prevent injection attacks
2. **Implement output encoding** - Prevent XSS
3. **Add RBAC middleware** - Enforce access control
4. **Enable WAF rules** - Block common attack patterns
5. **Audit all endpoints** - Remove unnecessary exposure`;
  }

  // Generic target analysis
  return `## Attack Simulation Report

**Target:** ${context.target}
**Domain:** ${domain}
**Type:** ${context.type === "web" ? "Web Application" : "API Endpoint"}
**Detected Stack:** ${techStack.join(", ")}

---

### Reconnaissance Results

| Check | Result | Risk |
|-------|--------|------|
| DNS Records | Analyzed | Low |
| SSL Certificate | Valid | Info |
| Technology Detection | ${techStack.join(", ")} | Info |
| Open Ports | 80, 443 | Info |
| Security Headers | Partial | Medium |

---

### Potential Vulnerabilities

| Severity | Vulnerability | Assessment |
|----------|--------------|------------|
| MEDIUM | Missing Security Headers | CSP, X-Frame-Options may be absent |
| MEDIUM | Input Validation | Forms should be tested for injection |
| LOW | CORS Policy | Configuration should be reviewed |
| LOW | Cookie Security | HttpOnly/Secure flags should be verified |
| INFO | Error Handling | Error messages should not leak info |

---

### Recommended Attack Vectors to Test

1. **Authentication Testing**
   - Brute force protection
   - Session management
   - Password policy enforcement

2. **Input Validation**
   - SQL/NoSQL injection points
   - XSS in all input fields
   - Command injection in any system calls

3. **Access Control**
   - Horizontal privilege escalation
   - Vertical privilege escalation
   - IDOR vulnerabilities

4. **API Security** (if ${context.type === "api" ? "applicable" : "detected"})
   - Rate limiting
   - Authentication bypass
   - Mass assignment

---

### Next Steps

Run \`/impact <breach_type>\` to analyze how specific breach scenarios would affect **${domain}**`;
}

export function getDemoImpactAnalysis(incident: string, context: ProjectContext): string {
  const domain = extractDomain(context.target);
  const techStack = inferTechStack(context.target);
  const incidentLower = incident.toLowerCase();
  
  // Vercel/Deployment platform breach
  if (incidentLower.includes("vercel") || incidentLower.includes("deployment") || incidentLower.includes("netlify")) {
    const platform = incidentLower.includes("netlify") ? "Netlify" : "Vercel";
    return `## Breach Impact Analysis: ${incident}

**Your Application:** ${context.target}
**Domain:** ${domain}
**Tech Stack:** ${techStack.join(", ")}

---

### How This Breach Affects YOUR System

If ${platform} was breached and your application (**${domain}**) is deployed there, here's the specific impact:

---

### Exposed Assets (High Risk)

| Asset | Location | Impact on ${domain} |
|-------|----------|---------------------|
| Environment Variables | ${platform} Dashboard | **CRITICAL** - All secrets exposed |
| Source Code | Git Integration | **HIGH** - Business logic revealed |
| Build Logs | CI/CD Pipeline | **MEDIUM** - May contain secrets |
| Deployment Tokens | API Access | **HIGH** - Unauthorized deployments |

---

### Specific Credentials at Risk for ${domain}

Based on typical ${techStack.join("/")} deployments:

| Credential Type | Likely Variable | Action Required |
|-----------------|-----------------|-----------------|
| Database URL | \`DATABASE_URL\` | **ROTATE IMMEDIATELY** |
| API Keys | \`API_KEY\`, \`SECRET_KEY\` | **ROTATE IMMEDIATELY** |
| Auth Secrets | \`JWT_SECRET\`, \`SESSION_SECRET\` | **ROTATE + INVALIDATE SESSIONS** |
| Third-Party APIs | \`STRIPE_KEY\`, \`SENDGRID_KEY\` | **ROTATE IN PROVIDER DASHBOARD** |
| OAuth Secrets | \`OAUTH_CLIENT_SECRET\` | **ROTATE + RE-CONFIGURE** |

---

### Attack Scenarios Against ${domain}

1. **Database Compromise**
   - Attacker obtains \`DATABASE_URL\`
   - Direct access to all user data
   - Can modify, delete, or ransom data

2. **Authentication Bypass**
   - \`JWT_SECRET\` allows forging tokens
   - Attacker can impersonate any user
   - Admin access possible

3. **Supply Chain Attack**
   - Malicious code injected into builds
   - Affects all users of ${domain}
   - Persistent backdoor possible

---

### Immediate Actions for ${domain}

\`\`\`
HOUR 1 (Critical):
├── Rotate DATABASE_URL and all database credentials
├── Generate new JWT_SECRET and invalidate all sessions  
├── Rotate all third-party API keys (Stripe, etc.)
└── Review recent deployments for unauthorized changes

HOUR 2-4 (High Priority):
├── Audit ${platform} access logs for your project
├── Review git history for suspicious commits
├── Enable enhanced security (2FA, IP restrictions)
└── Notify your security team/incident response

DAY 1-2 (Recovery):
├── Implement secrets manager (Vault, AWS Secrets Manager)
├── Set up secret rotation policies
├── Deploy monitoring for credential usage
└── Document incident for compliance
\`\`\`

---

### Compliance Implications for ${domain}

- **GDPR**: 72-hour breach notification may be required
- **SOC2**: Incident documentation required
- **PCI-DSS**: If processing payments, card brands must be notified`;
  }

  // API Key / Credential leak
  if (incidentLower.includes("api") || incidentLower.includes("key") || incidentLower.includes("leak") || incidentLower.includes("credential")) {
    return `## Breach Impact Analysis: ${incident}

**Your Application:** ${context.target}
**Domain:** ${domain}
**Tech Stack:** ${techStack.join(", ")}

---

### Impact on ${domain}

An API key leak affecting your application would have the following consequences:

---

### Risk Assessment Matrix

| API/Service | If Key Leaked | Impact on ${domain} | Severity |
|-------------|---------------|---------------------|----------|
| Database | Direct data access | User data theft, manipulation | CRITICAL |
| Auth Provider | Account takeover | Full user impersonation | CRITICAL |
| Payment (Stripe) | Financial fraud | Unauthorized charges | CRITICAL |
| Email (SendGrid) | Spam/Phishing | Reputation damage | HIGH |
| Storage (S3) | Data theft | File exfiltration | HIGH |
| Analytics | Privacy breach | User behavior exposure | MEDIUM |

---

### What Attackers Can Do to ${domain}

**With Database Credentials:**
\`\`\`
- Export entire user database
- Modify user permissions/roles  
- Delete or ransom data
- Plant persistent backdoors
\`\`\`

**With Auth Secrets:**
\`\`\`
- Forge valid authentication tokens
- Bypass MFA for any user
- Create admin accounts
- Persist access indefinitely
\`\`\`

**With Payment API Keys:**
\`\`\`
- View transaction history
- Issue unauthorized refunds
- Create fraudulent charges
- Access customer payment methods
\`\`\`

---

### Detection Checklist for ${domain}

| Check | How to Verify | Status |
|-------|---------------|--------|
| Unusual API traffic | Check logs for spikes | [ ] |
| New admin accounts | Query user table | [ ] |
| Modified records | Audit trail review | [ ] |
| Unexpected charges | Payment dashboard | [ ] |
| Failed auth attempts | Auth provider logs | [ ] |

---

### Recovery Plan for ${domain}

**Phase 1: Containment (0-2 hours)**
- Identify which specific keys were exposed
- Revoke compromised keys immediately
- Deploy with new credentials

**Phase 2: Assessment (2-24 hours)**
- Audit all API access logs
- Identify unauthorized actions
- Assess data exposure scope

**Phase 3: Notification (24-72 hours)**
- Notify affected users if data accessed
- Report to relevant authorities if required
- Update stakeholders on status

**Phase 4: Hardening (1-2 weeks)**
- Implement key rotation policies
- Add anomaly detection
- Enhanced monitoring deployment`;
  }

  // OAuth / Authentication breach
  if (incidentLower.includes("oauth") || incidentLower.includes("auth") || incidentLower.includes("sso") || incidentLower.includes("okta") || incidentLower.includes("auth0")) {
    const provider = incidentLower.includes("okta") ? "Okta" : incidentLower.includes("auth0") ? "Auth0" : "OAuth Provider";
    return `## Breach Impact Analysis: ${incident}

**Your Application:** ${context.target}
**Domain:** ${domain}
**Auth Integration:** ${provider}

---

### Impact on ${domain} Users

If ${provider} was breached and ${domain} uses it for authentication:

---

### Affected Authentication Flows

| Flow | Risk to ${domain} | User Impact |
|------|-------------------|-------------|
| SSO Login | CRITICAL | All SSO users compromised |
| OAuth Tokens | CRITICAL | Active sessions hijackable |
| API Authorization | HIGH | M2M tokens at risk |
| MFA Seeds | HIGH | 2FA can be bypassed |
| User Directory | MEDIUM | User data exposed |

---

### Specific Risks for ${domain}

**Session Hijacking:**
- Attacker can steal active session tokens
- No re-authentication required
- Access persists until token expires
- Affects: ${techStack.includes("Next.js") ? "Next-Auth sessions" : "All authenticated users"}

**Token Forgery:**
- If signing keys compromised
- Attacker creates valid JWTs
- Can impersonate any user
- Affects: API calls, protected routes

**Lateral Movement:**
- ${domain} users likely use SSO elsewhere
- Compromised identity = access to multiple apps
- Business email access possible
- Affects: Connected services, data

---

### User Impact Analysis for ${domain}

| User Type | Risk Level | Immediate Action |
|-----------|------------|------------------|
| Admin Users | CRITICAL | Force logout + password reset |
| Regular Users | HIGH | Invalidate sessions |
| API Clients | HIGH | Rotate client credentials |
| Service Accounts | MEDIUM | Review and rotate |

---

### Remediation Steps for ${domain}

\`\`\`
IMMEDIATE (Within 1 hour):
├── Invalidate ALL active sessions
├── Rotate OAuth client secret
├── Force re-authentication for all users
└── Enable security alerts

SHORT-TERM (Within 24 hours):
├── Review ${provider} audit logs
├── Check for unauthorized app registrations
├── Verify OAuth scopes haven't changed
└── Notify users to watch for phishing

LONG-TERM (Within 1 week):
├── Implement session binding (device, IP)
├── Add step-up authentication for sensitive ops
├── Deploy continuous authentication monitoring
└── Review backup auth methods
\`\`\`

---

### User Communication Template

> **Security Notice for ${domain} Users**
> 
> Due to a security incident with our authentication provider, we have logged out all users as a precaution. Please log in again with your credentials. We recommend enabling 2FA if you haven't already.`;
  }

  // Generic breach analysis
  return `## Breach Impact Analysis: ${incident}

**Your Application:** ${context.target}
**Domain:** ${domain}
**Tech Stack:** ${techStack.join(", ")}

---

### General Impact Assessment

This section analyzes how **${incident}** could affect your application at **${domain}**.

---

### Potential Exposure Areas for ${domain}

| Area | Risk Level | Likelihood |
|------|------------|------------|
| User Data | HIGH | Depends on breach scope |
| Credentials | HIGH | If stored in affected system |
| Business Logic | MEDIUM | Source code exposure |
| Infrastructure | MEDIUM | Config/secrets exposure |
| Third-Party Data | LOW-MEDIUM | API integrations |

---

### Questions to Assess Impact

1. **Does ${domain} use or integrate with the breached service?**
   - If YES: High priority assessment needed
   - If NO: Monitor for secondary effects

2. **What data does the integration have access to?**
   - User PII?
   - Payment information?
   - Authentication tokens?

3. **Are there shared credentials?**
   - Same passwords used elsewhere?
   - Shared API keys?
   - Common service accounts?

---

### Recommended Actions for ${domain}

**Discovery Phase:**
- Map all integrations with affected service
- Identify shared credentials or data
- Review access logs for anomalies

**Containment Phase:**
- Rotate any potentially exposed credentials
- Enable enhanced monitoring
- Prepare incident response team

**Recovery Phase:**
- Implement additional security controls
- Update security policies
- Document lessons learned

---

### Run Specific Analysis

For more detailed analysis, try:
- \`/impact vercel breach\` - Deployment platform compromise
- \`/impact api key leak\` - Credential exposure
- \`/impact oauth compromise\` - Authentication provider breach
- \`/breach .env leak\` - Environment file exposure response`;
}

export function getDemoBreachResponse(breachType: string, context: ProjectContext): string {
  const domain = extractDomain(context.target);
  const techStack = inferTechStack(context.target);
  const breachLower = breachType.toLowerCase();

  if (breachLower.includes("env") || breachLower.includes(".env") || breachLower.includes("environment")) {
    return `## Incident Response: ${breachType}

**Affected Application:** ${context.target}
**Domain:** ${domain}
**Severity:** CRITICAL

---

### Exposure Analysis for ${domain}

Your \`.env\` file likely contains these sensitive values:

| Variable | Purpose | Risk if Exposed |
|----------|---------|-----------------|
| \`DATABASE_URL\` | Database connection | Full data access |
| \`JWT_SECRET\` | Token signing | Session forgery |
| \`API_KEYS\` | Third-party services | Service abuse |
| \`OAUTH_SECRET\` | Authentication | Account takeover |
| \`SMTP_PASSWORD\` | Email service | Phishing campaigns |

---

### Immediate Response Checklist for ${domain}

**MINUTE 1-15: Containment**
- [ ] Remove exposed file from public access
- [ ] Rotate \`DATABASE_URL\` credentials
- [ ] Generate new \`JWT_SECRET\`
- [ ] Revoke all active sessions
- [ ] Change cloud provider passwords

**MINUTE 15-60: Assessment**
- [ ] Determine exposure duration
- [ ] Check git history for file
- [ ] Review access logs for unauthorized use
- [ ] Identify all affected credentials

**HOUR 1-4: Rotation**
- [ ] Rotate ALL third-party API keys:
  ${techStack.includes("Stripe") ? "  - Stripe: dashboard.stripe.com/apikeys" : "  - Payment provider API keys"}
  - Email service (SendGrid/Postmark/SES)
  - Storage (AWS S3/Cloudflare R2)
  - Analytics/Monitoring keys

**HOUR 4-24: Verification**
- [ ] Deploy with new credentials
- [ ] Verify all integrations working
- [ ] Monitor for unauthorized access
- [ ] Enable secrets scanning in CI/CD

---

### Git History Remediation

If \`.env\` was committed to git:

\`\`\`bash
# Remove from history (destructive - backup first!)
git filter-branch --force --index-filter \\
  "git rm --cached --ignore-unmatch .env" \\
  --prune-empty --tag-name-filter cat -- --all

# Force push (coordinate with team!)
git push origin --force --all
git push origin --force --tags

# All team members must:
git fetch origin
git reset --hard origin/main
\`\`\`

---

### Prevention for ${domain}

1. **Immediate:** Add to \`.gitignore\`:
   \`\`\`
   .env
   .env.local
   .env.*.local
   \`\`\`

2. **CI/CD:** Add pre-commit hook:
   \`\`\`bash
   # .git/hooks/pre-commit
   if git diff --cached --name-only | grep -q ".env"; then
     echo "ERROR: Attempting to commit .env file!"
     exit 1
   fi
   \`\`\`

3. **Long-term:** Use secrets manager:
   - Vercel: Environment Variables UI
   - AWS: Secrets Manager
   - HashiCorp Vault

---

### Compliance Notifications

| Regulation | Requirement | Deadline |
|------------|-------------|----------|
| GDPR | DPA notification | 72 hours |
| CCPA | User notification | "Without unreasonable delay" |
| SOC2 | Incident documentation | 24 hours |`;
  }

  if (breachLower.includes("database") || breachLower.includes("db") || breachLower.includes("sql") || breachLower.includes("data")) {
    return `## Incident Response: ${breachType}

**Affected Application:** ${context.target}
**Domain:** ${domain}
**Severity:** CRITICAL

---

### Data at Risk in ${domain}

| Data Type | Likely Tables | Exposure Risk |
|-----------|---------------|---------------|
| User Credentials | \`users\`, \`accounts\` | Password hashes, emails |
| Personal Info | \`profiles\`, \`customers\` | Names, addresses, phone |
| Financial Data | \`orders\`, \`payments\` | Transaction history |
| Session Data | \`sessions\`, \`tokens\` | Active sessions |
| Business Data | \`products\`, \`inventory\` | Proprietary information |

---

### Immediate Response for ${domain}

**PHASE 1: Containment (0-1 hour)**

\`\`\`sql
-- Immediately revoke external access
REVOKE ALL PRIVILEGES ON ALL TABLES FROM public_user;

-- Force disconnect all sessions
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = 'production';

-- Enable audit logging
ALTER SYSTEM SET log_statement = 'all';
SELECT pg_reload_conf();
\`\`\`

**PHASE 2: Assessment (1-4 hours)**

\`\`\`sql
-- Check for data exfiltration
SELECT usename, query, query_start 
FROM pg_stat_activity 
WHERE query ILIKE '%SELECT%FROM%users%'
ORDER BY query_start DESC;

-- Review recent large exports
SELECT * FROM pg_stat_user_tables 
WHERE n_tup_ins > 1000 OR n_tup_del > 100;
\`\`\`

**PHASE 3: User Protection (4-24 hours)**
- [ ] Force password reset for all users
- [ ] Invalidate all session tokens
- [ ] Enable enhanced login monitoring
- [ ] Notify affected users

---

### Password Security Verification

Check your password hashing:

\`\`\`javascript
// SECURE - bcrypt with cost factor >= 12
const hash = await bcrypt.hash(password, 12);

// INSECURE - MD5/SHA1 (change immediately!)
// If you find: crypto.createHash('md5')
// Or: crypto.createHash('sha1')
// Users are at HIGH RISK
\`\`\`

If using weak hashing, users should:
1. Reset passwords immediately
2. Be notified their credentials may be compromised
3. Check for credential reuse on other sites

---

### Recovery Checklist for ${domain}

| Task | Status | Owner |
|------|--------|-------|
| Database credentials rotated | [ ] | DevOps |
| Connection strings updated | [ ] | DevOps |
| All users force logged out | [ ] | Backend |
| Password reset emails sent | [ ] | Backend |
| Audit logs preserved | [ ] | Security |
| Forensic snapshot taken | [ ] | Security |
| Law enforcement notified | [ ] | Legal |
| User notification sent | [ ] | Comms |`;
  }

  // Generic breach response
  return `## Incident Response: ${breachType}

**Affected Application:** ${context.target}
**Domain:** ${domain}
**Tech Stack:** ${techStack.join(", ")}

---

### Response Framework for ${domain}

#### Phase 1: Identification (0-30 minutes)

**Determine Scope:**
- What systems are affected?
- What data was potentially exposed?
- How long was the exposure?
- Who discovered the breach?

**Document Everything:**
- [ ] Timestamp of discovery
- [ ] Initial findings
- [ ] Systems involved
- [ ] Personnel notified

---

#### Phase 2: Containment (30 min - 2 hours)

**Immediate Actions for ${domain}:**

| Action | Priority | Status |
|--------|----------|--------|
| Isolate affected systems | CRITICAL | [ ] |
| Preserve evidence/logs | CRITICAL | [ ] |
| Rotate exposed credentials | HIGH | [ ] |
| Enable enhanced monitoring | HIGH | [ ] |
| Notify incident team | HIGH | [ ] |

**DO NOT:**
- Delete logs or evidence
- Shut down systems without forensic capture
- Communicate externally before legal review
- Attempt to "fix" without documentation

---

#### Phase 3: Eradication (2-24 hours)

**Remove Threat:**
- Identify root cause
- Remove malicious access
- Patch vulnerabilities
- Verify clean state

**Credential Rotation for ${domain}:**
\`\`\`
Priority 1: Database credentials
Priority 2: API keys and tokens
Priority 3: Service accounts
Priority 4: User sessions (force re-auth)
\`\`\`

---

#### Phase 4: Recovery (1-7 days)

**Restore Operations:**
- Deploy patched systems
- Restore from clean backups if needed
- Verify all integrations
- Enhanced monitoring active

**Validation Checklist:**
- [ ] All credentials rotated
- [ ] Vulnerabilities patched
- [ ] Monitoring enhanced
- [ ] Incident documented
- [ ] Users notified (if required)

---

#### Phase 5: Lessons Learned (1-2 weeks)

**Post-Incident Review:**
- Root cause analysis
- Timeline reconstruction
- Control gap identification
- Improvement recommendations

**Document for ${domain}:**
- What happened
- How it was discovered
- Response timeline
- What worked well
- What needs improvement`;
}

export function getDemoHelpMessage(): string {
  return `## BreachSense - AI Security Agent

Welcome to BreachSense! I help you analyze security vulnerabilities, simulate attacks, and respond to breaches.

---

### Available Commands

| Command | Description | Example |
|---------|-------------|---------|
| \`/target <url>\` | Set target application | \`/target https://myapp.vercel.app\` |
| \`/break\` | Simulate attack on target | \`/break\` |
| \`/impact <incident>\` | Analyze breach impact | \`/impact vercel breach\` |
| \`/breach <type>\` | Get incident response plan | \`/breach .env leak\` |
| \`/help\` | Show this help message | \`/help\` |

---

### Impact Analysis Examples

Analyze how external breaches affect YOUR system:

- \`/impact vercel breach\` - Deployment platform compromise
- \`/impact api key leak\` - Exposed API credentials
- \`/impact oauth compromise\` - OAuth token exposure
- \`/impact database breach\` - Database server breach
- \`/impact npm supply chain\` - Dependency compromise

---

### Breach Response Examples

Get incident response guidance:

- \`/breach .env leak\` - Environment file exposed
- \`/breach token exposure\` - Auth tokens compromised
- \`/breach database leak\` - Database credentials exposed
- \`/breach admin access\` - Unauthorized admin access

---

### Quick Start

1. Set your target: \`/target https://your-app.com\`
2. Run attack simulation: \`/break\`
3. Analyze breach impact: \`/impact api key leak\`

Click the gear icon in the header to configure your target application.`;
}

export function getDemoGeneralResponse(query: string, context: ProjectContext): string {
  const domain = extractDomain(context.target);
  const techStack = inferTechStack(context.target);
  const lowerQuery = query.toLowerCase();
  
  // Check for security-related keywords
  if (lowerQuery.includes("vulnerability") || lowerQuery.includes("vuln")) {
    return `## Vulnerability Assessment for ${domain}

Based on the target **${context.target}**, here are common vulnerability categories to check:

### Web Application Vulnerabilities
- **Injection Attacks** - SQL, NoSQL, Command injection
- **Broken Authentication** - Weak passwords, session hijacking
- **Sensitive Data Exposure** - Unencrypted data, PII leaks
- **XML External Entities (XXE)** - XML parser vulnerabilities
- **Broken Access Control** - Privilege escalation, IDOR
- **Security Misconfiguration** - Default settings, verbose errors
- **Cross-Site Scripting (XSS)** - Reflected, Stored, DOM-based
- **Insecure Deserialization** - Object manipulation
- **Using Components with Known Vulnerabilities** - Outdated dependencies
- **Insufficient Logging** - Missing audit trails

**Recommended Action:** Run \`/break\` to simulate an attack and identify specific vulnerabilities.`;
  }
  
  if (lowerQuery.includes("secure") || lowerQuery.includes("harden") || lowerQuery.includes("protect")) {
    return `## Security Hardening Recommendations for ${domain}

### Detected Technology Stack
${techStack.map(t => `- ${t}`).join("\n")}

### Immediate Security Actions

**1. Authentication & Access**
- Implement MFA for all admin accounts
- Use secure session management
- Apply principle of least privilege

**2. Data Protection**
- Encrypt data at rest and in transit
- Implement proper key management
- Regular backup verification

**3. Infrastructure**
- Enable WAF protection
- Configure security headers
- Regular security patches

**4. Monitoring**
- Enable comprehensive logging
- Set up intrusion detection
- Configure alerting for anomalies

**5. Code Security**
- Regular dependency updates
- Static code analysis
- Security code reviews

Run \`/break\` to test your current security posture.`;
  }
  
  if (lowerQuery.includes("attack") || lowerQuery.includes("hack") || lowerQuery.includes("penetration")) {
    return `## Attack Surface Analysis for ${domain}

To simulate an attack on your target, use the \`/break\` command.

### Common Attack Vectors

**External Attacks:**
- Network scanning and enumeration
- Web application attacks (OWASP Top 10)
- API endpoint abuse
- Social engineering

**Internal Threats:**
- Insider access abuse
- Credential theft
- Data exfiltration
- Privilege escalation

**Supply Chain:**
- Compromised dependencies
- Third-party service breaches
- CI/CD pipeline attacks

**Ready to simulate?** Run \`/break\` now.`;
  }
  
  // Default response
  return `## BreachSense Response

**Current Target:** ${context.target}
**Domain:** ${domain}
**Detected Stack:** ${techStack.join(", ")}

---

I understand you're asking about: "${query}"

Here's what I can help you with:

### Security Analysis Commands

| Command | What it does |
|---------|-------------|
| \`/break\` | Simulate attack on ${domain} |
| \`/impact <breach>\` | Analyze how a breach affects your system |
| \`/breach <type>\` | Get incident response guidance |
| \`/help\` | Show all available commands |

### Example Queries

- \`/impact vercel breach\` - How would a Vercel breach affect ${domain}?
- \`/breach .env leak\` - What to do if .env file is leaked?
- \`/break\` - Simulate attack on current target

---

**Tip:** Click the gear icon to change your target application, or use \`/target <url>\`.`;
}
