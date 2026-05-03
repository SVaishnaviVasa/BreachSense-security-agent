import type { ProjectContext } from "@/lib/context/store";

// Demo mode responses for when AI Gateway is not available
// These provide realistic, structured responses that match what the AI would generate

export function getDemoAttackSimulation(context: ProjectContext): string {
  const isJuiceShop = context.target.includes("juice-shop") || context.target.includes("owasp");
  
  if (isJuiceShop) {
    return `**🎯 Attack Simulation Report**

**Target:** ${context.target}
**Type:** ${context.type === "web" ? "Web Application" : "API"}

**🔓 Vulnerabilities Discovered:**

1. 🔴 **SQL Injection (Critical)** - Login form vulnerable to authentication bypass
   - Location: \`/rest/user/login\`
   - Payload: \`' OR 1=1--\`

2. 🔴 **Cross-Site Scripting (XSS)** - Stored XSS in product search and reviews
   - Location: \`/#/search\`, \`/api/Feedbacks\`
   - Type: Reflected and Stored XSS

3. 🟡 **Broken Access Control** - Admin functions accessible via direct URL manipulation
   - Location: \`/#/administration\`
   - Impact: Unauthorized admin access

4. 🟡 **Sensitive Data Exposure** - API exposes user data without proper filtering
   - Location: \`/api/Users\`
   - Exposed: Email addresses, password hints

5. 🟢 **Security Misconfiguration** - Verbose error messages reveal stack traces
   - Impact: Information leakage for further attacks

**⛓️ Attack Chain:**

1. **Reconnaissance** - Scan for exposed endpoints using \`/api-docs\` and \`/ftp\`
2. **Initial Access** - Exploit SQL injection in login: \`admin'--\` to bypass authentication
3. **Privilege Escalation** - Access admin panel via \`/#/administration\`
4. **Data Exfiltration** - Dump user database via \`/api/Users\` endpoint
5. **Persistence** - Create backdoor admin account for future access

**📊 Confidence Level:** High

**🛡️ Immediate Recommendations:**

1. Implement parameterized queries for all database operations
2. Add input sanitization and output encoding for XSS prevention
3. Enforce role-based access control on all admin routes
4. Implement rate limiting and Web Application Firewall (WAF)`;
  }

  // Generic response for other targets
  return `**🎯 Attack Simulation Report**

**Target:** ${context.target}
**Type:** ${context.type === "web" ? "Web Application" : "API"}

**🔓 Vulnerabilities Discovered:**

1. 🟡 **Authentication Weakness** - Session management could be improved
   - Recommendation: Implement secure session tokens with proper expiration

2. 🟡 **Input Validation** - Some input fields may be vulnerable to injection
   - Recommendation: Implement server-side validation for all inputs

3. 🟡 **CORS Configuration** - Cross-origin policies should be reviewed
   - Recommendation: Restrict CORS to specific trusted domains

4. 🟢 **Security Headers** - Some recommended headers may be missing
   - Recommendation: Add CSP, X-Frame-Options, X-Content-Type-Options

5. 🟢 **Rate Limiting** - API endpoints may benefit from rate limiting
   - Recommendation: Implement rate limiting to prevent brute force

**⛓️ Attack Chain:**

1. **Reconnaissance** - Enumerate endpoints and identify technologies
2. **Vulnerability Analysis** - Test for common web vulnerabilities
3. **Exploitation Attempt** - Target identified weaknesses
4. **Impact Assessment** - Evaluate potential data access
5. **Report Generation** - Document findings and recommendations

**📊 Confidence Level:** Medium

**🛡️ Immediate Recommendations:**

1. Conduct a full security audit of authentication mechanisms
2. Implement comprehensive input validation
3. Review and harden CORS and security header configurations
4. Set up monitoring and alerting for suspicious activities`;
}

export function getDemoImpactAnalysis(incident: string, context: ProjectContext): string {
  const incidentLower = incident.toLowerCase();
  
  if (incidentLower.includes("vercel") || incidentLower.includes("deployment")) {
    return `**🌐 Global Breach Impact Analysis**

**Incident:** ${incident}

**💥 Impact Assessment:**

- 🔴 **Environment Variable Exposure** - If your app uses Vercel, environment variables (API keys, database credentials, secrets) may be at risk
- 🔴 **Source Code Access** - Deployment configurations could reveal your application architecture and sensitive logic
- 🟡 **Third-Party Integration Risk** - Any integrated services (databases, APIs, auth providers) may need credential rotation
- 🟡 **Build-time Secrets** - Secrets injected during build could be compromised

**⚠️ Risk Level:** 🔴 High

**🎯 Affected Systems:**

- **Deployment Platform** - All Vercel-hosted projects
- **Environment Variables** - Database URLs, API keys, OAuth secrets
- **CI/CD Pipeline** - Build configurations and deployment tokens
- **Integrated Services** - Any third-party APIs using exposed credentials
- **Target Application** - ${context.target}

**🔐 Immediate Actions Required:**

1. **Rotate ALL secrets** stored in Vercel environment variables
2. **Revoke and regenerate** all API keys and tokens
3. **Review access logs** for unauthorized access patterns
4. **Enable MFA** on all team accounts if not already active
5. **Audit deployment history** for suspicious changes

**📋 Long-term Recommendations:**

1. Implement secrets management solution (HashiCorp Vault, AWS Secrets Manager)
2. Use short-lived credentials where possible
3. Set up automated secret rotation policies`;
  }

  if (incidentLower.includes("api") || incidentLower.includes("key") || incidentLower.includes("leak")) {
    return `**🌐 Global Breach Impact Analysis**

**Incident:** ${incident}

**💥 Impact Assessment:**

- 🔴 **Unauthorized API Access** - Exposed keys allow attackers to make authenticated requests
- 🔴 **Data Theft Risk** - Any data accessible via the API could be exfiltrated
- 🟡 **Rate Limit Abuse** - Attackers may consume your API quotas
- 🟡 **Financial Impact** - Usage-based APIs could incur unexpected charges

**⚠️ Risk Level:** 🔴 High

**🎯 Affected Systems:**

- **API Services** - All endpoints accessible with the leaked key
- **Data Storage** - Databases and storage services using the compromised credentials
- **Third-Party Services** - External APIs (Stripe, Twilio, AWS) using exposed keys
- **User Data** - Personal information accessible through compromised APIs
- **Target Application** - ${context.target}

**🔐 Immediate Actions Required:**

1. **Immediately revoke** the compromised API key
2. **Generate new credentials** with restricted permissions
3. **Audit API logs** for unauthorized usage
4. **Check billing** for unexpected charges
5. **Notify affected users** if their data was potentially accessed

**📋 Long-term Recommendations:**

1. Implement API key rotation policies
2. Use environment-specific keys with minimal required permissions
3. Set up anomaly detection for API usage patterns`;
  }

  if (incidentLower.includes("oauth") || incidentLower.includes("auth") || incidentLower.includes("sso")) {
    return `**🌐 Global Breach Impact Analysis**

**Incident:** ${incident}

**💥 Impact Assessment:**

- 🔴 **Account Takeover Risk** - Attackers could impersonate users across all SSO-connected services
- 🔴 **Session Hijacking** - Active sessions may be vulnerable to hijacking
- 🟡 **Privilege Escalation** - OAuth scopes may allow access beyond intended permissions
- 🟡 **Lateral Movement** - Compromised tokens could access multiple connected applications

**⚠️ Risk Level:** 🔴 Critical

**🎯 Affected Systems:**

- **Identity Provider** - OAuth/SSO provider accounts and configurations
- **Connected Applications** - All apps using the compromised OAuth flow
- **User Sessions** - Active sessions using OAuth tokens
- **API Authorizations** - Third-party apps with OAuth permissions
- **Target Application** - ${context.target}

**🔐 Immediate Actions Required:**

1. **Invalidate all OAuth tokens** and force re-authentication
2. **Rotate OAuth client secrets** immediately
3. **Review OAuth scopes** and reduce permissions
4. **Enable session monitoring** for anomalous behavior
5. **Force password resets** for potentially affected users

**📋 Long-term Recommendations:**

1. Implement token binding and additional verification
2. Use short-lived tokens with refresh token rotation
3. Set up continuous authentication monitoring`;
  }

  // Generic incident response
  return `**🌐 Global Breach Impact Analysis**

**Incident:** ${incident}

**💥 Impact Assessment:**

- 🟡 **Potential Data Exposure** - Review what data could be accessed
- 🟡 **Credential Risk** - Assess if any credentials may be compromised
- 🟡 **Service Continuity** - Evaluate impact on operations
- 🟢 **Reputation Impact** - Consider customer communication needs

**⚠️ Risk Level:** 🟡 Medium

**🎯 Affected Systems:**

- **Primary Application** - ${context.target}
- **Connected Services** - Review all integrations
- **Data Stores** - Audit database access
- **User Accounts** - Monitor for suspicious activity

**🔐 Immediate Actions Required:**

1. **Assess the scope** of the potential breach
2. **Secure affected systems** and isolate if necessary
3. **Review access logs** for unauthorized activity
4. **Notify stakeholders** according to incident response plan
5. **Document everything** for post-incident analysis

**📋 Long-term Recommendations:**

1. Update incident response procedures based on lessons learned
2. Implement additional monitoring and alerting
3. Conduct security awareness training for team`;
}

export function getDemoBreachResponse(breachType: string, context: ProjectContext): string {
  const breachLower = breachType.toLowerCase();

  if (breachLower.includes("env") || breachLower.includes(".env")) {
    return `**🚨 Breach Response Plan**

**Breach Type:** ${breachType}

**🔍 Exposure Analysis:**

- 🔴 **Database Credentials** - MongoDB/PostgreSQL connection strings with full access
- 🔴 **API Keys** - Third-party service keys (Stripe, SendGrid, AWS)
- 🔴 **Authentication Secrets** - JWT secrets, session keys, OAuth client secrets
- 🟡 **Service URLs** - Internal service endpoints and admin URLs

**💀 Potential Attacker Actions:**

- **Database Access** - Full read/write access to production data
- **Financial Fraud** - Use payment API keys for unauthorized transactions
- **Account Takeover** - Forge authentication tokens
- **Infrastructure Compromise** - Access cloud resources via exposed AWS/GCP keys

**🛡️ Immediate Actions (First 1 Hour):**

1. ⚡ **Rotate ALL credentials** in the exposed .env file
2. ⚡ **Revoke API keys** from third-party service dashboards
3. ⚡ **Invalidate JWT secrets** and force all users to re-authenticate
4. ⚡ **Change database passwords** and update connection strings
5. ⚡ **Review recent logs** for unauthorized access attempts

**📋 Short-term Actions (24-48 Hours):**

1. **Audit all services** for unauthorized changes or access
2. **Review git history** to determine exposure duration
3. **Set up secrets scanning** in CI/CD pipeline
4. **Implement secrets manager** (Vault, AWS Secrets Manager)

**🔒 Prevention Measures:**

- Use \`.gitignore\` to exclude \`.env\` files from version control
- Implement pre-commit hooks to scan for secrets
- Use environment variables from secure vault services
- Conduct regular secret rotation

**✅ Recovery Checklist:**

1. [ ] All database credentials rotated
2. [ ] All API keys regenerated
3. [ ] JWT/session secrets changed
4. [ ] Cloud provider credentials updated
5. [ ] Monitoring alerts configured
6. [ ] Incident documented for compliance`;
  }

  if (breachLower.includes("token") || breachLower.includes("jwt") || breachLower.includes("session")) {
    return `**🚨 Breach Response Plan**

**Breach Type:** ${breachType}

**🔍 Exposure Analysis:**

- 🔴 **Session Tokens** - Active user sessions can be hijacked
- 🔴 **JWT Secrets** - Attackers can forge valid authentication tokens
- 🟡 **Refresh Tokens** - Long-lived tokens provide persistent access
- 🟡 **API Tokens** - Service-to-service authentication compromised

**💀 Potential Attacker Actions:**

- **Impersonate Users** - Access accounts without credentials
- **Privilege Escalation** - Modify token claims to gain admin access
- **Persistent Access** - Use refresh tokens for long-term access
- **Data Exfiltration** - Access user data through authenticated endpoints

**🛡️ Immediate Actions (First 1 Hour):**

1. ⚡ **Rotate JWT signing secrets** immediately
2. ⚡ **Invalidate all active sessions** in the database
3. ⚡ **Force re-authentication** for all users
4. ⚡ **Revoke all refresh tokens**
5. ⚡ **Enable enhanced logging** for authentication events

**📋 Short-term Actions (24-48 Hours):**

1. **Implement token blacklisting** for compromised tokens
2. **Add token binding** to prevent token replay
3. **Review authentication logs** for suspicious activity
4. **Notify affected users** and recommend password changes

**🔒 Prevention Measures:**

- Implement short token expiration times
- Use token rotation for refresh tokens
- Add device/IP binding to tokens
- Store tokens securely (HttpOnly cookies, secure storage)

**✅ Recovery Checklist:**

1. [ ] JWT secrets rotated
2. [ ] All sessions invalidated
3. [ ] Users notified and re-authenticated
4. [ ] Token security hardened
5. [ ] Monitoring enhanced
6. [ ] Incident report completed`;
  }

  if (breachLower.includes("database") || breachLower.includes("db") || breachLower.includes("sql")) {
    return `**🚨 Breach Response Plan**

**Breach Type:** ${breachType}

**🔍 Exposure Analysis:**

- 🔴 **User Data** - PII, emails, hashed passwords potentially exposed
- 🔴 **Business Data** - Transactions, orders, internal records
- 🔴 **Authentication Data** - User credentials and session data
- 🟡 **Configuration Data** - Application settings and feature flags

**💀 Potential Attacker Actions:**

- **Data Theft** - Export entire database for sale or exploitation
- **Data Manipulation** - Modify records, inject malicious data
- **Credential Harvesting** - Attempt to crack password hashes
- **Ransom** - Encrypt or threaten to leak data

**🛡️ Immediate Actions (First 1 Hour):**

1. ⚡ **Change database credentials** immediately
2. ⚡ **Restrict database access** to known IPs only
3. ⚡ **Take forensic snapshot** before any changes
4. ⚡ **Review recent queries** for data exfiltration
5. ⚡ **Enable enhanced audit logging**

**📋 Short-term Actions (24-48 Hours):**

1. **Assess data exposure scope** and affected records
2. **Notify affected users** per regulatory requirements
3. **Force password resets** for all users
4. **Review application for injection vulnerabilities**

**🔒 Prevention Measures:**

- Implement database activity monitoring
- Use parameterized queries to prevent SQL injection
- Encrypt sensitive data at rest
- Regular database access audits

**✅ Recovery Checklist:**

1. [ ] Database credentials rotated
2. [ ] Access restricted and audited
3. [ ] Data exposure assessed
4. [ ] Users notified (if required)
5. [ ] Security patches applied
6. [ ] Compliance notifications sent`;
  }

  // Generic breach response
  return `**🚨 Breach Response Plan**

**Breach Type:** ${breachType}

**🔍 Exposure Analysis:**

- 🟡 **Sensitive Information** - Assess what data or systems are affected
- 🟡 **Access Credentials** - Determine if any credentials were exposed
- 🟡 **System Access** - Evaluate what systems attacker could access
- 🟢 **Lateral Movement Risk** - Assess potential for further compromise

**💀 Potential Attacker Actions:**

- **Information Gathering** - Use exposed data for further attacks
- **Credential Abuse** - Attempt to access other systems
- **Social Engineering** - Use information for targeted attacks
- **Data Monetization** - Sell or ransom exposed data

**🛡️ Immediate Actions (First 1 Hour):**

1. ⚡ **Identify the scope** of the breach
2. ⚡ **Contain the exposure** - revoke access, rotate credentials
3. ⚡ **Preserve evidence** for investigation
4. ⚡ **Alert security team** and stakeholders
5. ⚡ **Begin incident documentation**

**📋 Short-term Actions (24-48 Hours):**

1. **Conduct thorough investigation**
2. **Implement additional security controls**
3. **Notify affected parties** as required
4. **Review and update security policies**

**🔒 Prevention Measures:**

- Regular security assessments and penetration testing
- Implement least-privilege access controls
- Enhanced monitoring and alerting
- Security awareness training

**✅ Recovery Checklist:**

1. [ ] Breach scope identified
2. [ ] Credentials rotated
3. [ ] Systems secured
4. [ ] Stakeholders notified
5. [ ] Monitoring enhanced
6. [ ] Post-incident review scheduled`;
}

// Streaming helper to simulate typing effect
export async function* streamDemoResponse(text: string): AsyncGenerator<string> {
  const words = text.split(' ');
  for (let i = 0; i < words.length; i++) {
    yield words[i] + (i < words.length - 1 ? ' ' : '');
    // Small delay to simulate streaming
    await new Promise(resolve => setTimeout(resolve, 15 + Math.random() * 25));
  }
}
