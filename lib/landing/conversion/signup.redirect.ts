/**
 * V64 P1 — Post-demo signup redirect helpers
 */

const POST_SIGNUP_FALLBACK = "/quote";
const ALLOWED_POST_SIGNUP_PATHS = new Set(["/quote", "/budget", "/tender"]);

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

/**
 * Safe post-signup destination. Only relative /quote|/budget|/tender (+ search).
 * Rejects open redirects (//, \, http(s), protocol-relative).
 */
export function resolvePostSignupPath(returnTo?: string | null): string {
  if (typeof returnTo !== "string") return POST_SIGNUP_FALLBACK;
  const raw = returnTo.trim();
  if (!raw) return POST_SIGNUP_FALLBACK;
  if (!raw.startsWith("/") || raw.startsWith("//")) return POST_SIGNUP_FALLBACK;
  if (raw.includes("\\")) return POST_SIGNUP_FALLBACK;
  const lower = raw.toLowerCase();
  if (lower.includes("http:") || lower.includes("https:")) return POST_SIGNUP_FALLBACK;

  const pathOnly = raw.split(/[?#]/, 1)[0] ?? "";
  if (!ALLOWED_POST_SIGNUP_PATHS.has(pathOnly)) return POST_SIGNUP_FALLBACK;
  return raw;
}
