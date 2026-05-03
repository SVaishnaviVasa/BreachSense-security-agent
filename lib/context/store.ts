// In-memory context store for project context
export interface ProjectContext {
  target: string;
  type: "web" | "api";
  environment: "dev" | "qa" | "prod";
}

// Default context (OWASP Juice Shop as demo default)
const DEFAULT_CONTEXT: ProjectContext = {
  target: "https://juice-shop.herokuapp.com",
  type: "web",
  environment: "prod",
};

// In-memory store (per-session)
const contextStore = new Map<string, ProjectContext>();

export function getContext(sessionId: string = "default"): ProjectContext {
  return contextStore.get(sessionId) || { ...DEFAULT_CONTEXT };
}

export function setContext(
  sessionId: string = "default",
  context: Partial<ProjectContext>
): ProjectContext {
  const existing = getContext(sessionId);
  const updated = { ...existing, ...context };
  contextStore.set(sessionId, updated);
  return updated;
}

export function setTarget(
  sessionId: string = "default",
  target: string
): ProjectContext {
  // Detect type based on URL patterns
  const type = detectTargetType(target);
  return setContext(sessionId, { target, type });
}

function detectTargetType(url: string): "web" | "api" {
  const lowerUrl = url.toLowerCase();
  if (
    lowerUrl.includes("/api") ||
    lowerUrl.includes("/v1") ||
    lowerUrl.includes("/v2") ||
    lowerUrl.includes("/graphql") ||
    lowerUrl.includes("/rest")
  ) {
    return "api";
  }
  return "web";
}

export function clearContext(sessionId: string = "default"): void {
  contextStore.delete(sessionId);
}
