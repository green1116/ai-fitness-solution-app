/**
 * V64 P1 — Post-demo signup redirect helpers
 */

export function resolveSignupRedirect(source?: string, demoSessionId?: string): string {
  const params = new URLSearchParams();
  params.set("source", source ?? "demo");
  if (demoSessionId) params.set("demoSession", demoSessionId);
  return `/register?${params.toString()}`;
}

export function resolveLoginRedirect(returnTo?: string): string {
  if (!returnTo) return "/login";
  return `/login?returnTo=${encodeURIComponent(returnTo)}`;
}

export function resolvePostSignupPath(): string {
  return "/quote";
}
