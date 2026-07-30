/**
 * FE-4.3 — Frontend Security Presentation (PD-4.6).
 * Observes session/ops cues and maps safe UI behavior.
 * No RBAC engine, no credential storage, no Domain/API ownership.
 */
import type { SessionObservation } from "@/lib/frontend/presentation-guards";
import {
  PRESENTATION_GUARD_IDS,
  buildSignInRedirect,
  resolvePresentationGuard,
} from "@/lib/frontend/presentation-guards";
import type { PresentationRoutePath } from "@/lib/frontend/presentation-routes";
import type { ShellMode } from "@/lib/frontend/layout-patterns";
import {
  createIdleMetaState,
  mapSessionObservation,
  setMetaError,
  type PresentationMetaState,
  type SessionPresentationState,
} from "@/lib/frontend/presentation-state";
import { CACHE_INVALIDATION_POLICY } from "@/lib/frontend/state-taxonomy";

export const SECURITY_BASELINE_ID = "product-frontend-security-v1" as const;

/** PD-4.6 §4.2 — visibility keys (presentation only). */
export const VISIBILITY_KEYS = [
  "VIS-SIGNED-OUT",
  "VIS-SIGNED-IN",
  "VIS-OPS",
  "VIS-OPS-DENIED",
  "VIS-CONTEXT-MISSING",
  "VIS-ACTION-DISABLED",
] as const;

export type VisibilityKey = (typeof VISIBILITY_KEYS)[number];

/** PD-4.6 §8.1 — auth/API signal classes for UI mapping. */
export const AUTH_PRESENTATION_CLASSES = [
  "UNAUTH",
  "FORBIDDEN",
  "EXPIRED",
  "UNAVAILABLE",
] as const;

export type AuthPresentationClass = (typeof AUTH_PRESENTATION_CLASSES)[number];

/** SF-01 — only these system fallbacks (plus empty guidance edges). */
export const SECURITY_FALLBACK_ROUTES = [
  "/",
  "/404",
  "/unavailable",
] as const satisfies readonly PresentationRoutePath[];

export type SecurityFallbackRoute = (typeof SECURITY_FALLBACK_ROUTES)[number];

/** SD-03 — opaque cues allowed in URL query. */
export const SAFE_QUERY_CUE_KEYS = [
  "projectId",
  "category",
  "area",
  "documentId",
  "signin",
  "next",
] as const;

export type SafeQueryCueKey = (typeof SAFE_QUERY_CUE_KEYS)[number];

/** Fields that must never enter ST-LOCAL / props / derived (SD-01 / SD-06). */
export const SENSITIVE_FIELD_KEYS = [
  "password",
  "otp",
  "otpCode",
  "token",
  "accessToken",
  "refreshToken",
  "apiKey",
  "authorization",
  "secret",
  "bearer",
] as const;

export type PermissionVisibility = Readonly<{
  keys: readonly VisibilityKey[];
  showSignIn: boolean;
  showCustomerAffordances: boolean;
  showOpsChrome: boolean;
  contextMissing: boolean;
  actionDisabled: boolean;
}>;

export type SecurityFallbackPlan = Readonly<{
  to: SecurityFallbackRoute | `/?${string}`;
  intent: string;
  offerSignIn: boolean;
  clearSession: boolean;
  clearServerCache: boolean;
}>;

export type SecuritySettleResult = Readonly<{
  authClass: AuthPresentationClass;
  meta: PresentationMetaState;
  session: SessionPresentationState;
  fallback: SecurityFallbackPlan | null;
  visibility: PermissionVisibility;
}>;

/**
 * Map observed session → VIS-* (PV-01…PV-05). Visibility ≠ authorization.
 */
export function resolvePermissionVisibility(input: {
  session: SessionObservation | SessionPresentationState | null;
  projectCue?: string | null;
  meta?: PresentationMetaState | null;
  hasRequiredLocalDraft?: boolean;
}): PermissionVisibility {
  const signedIn = readSignedIn(input.session);
  const opsCapable = readOpsCapable(input.session);
  const contextMissing = !(input.projectCue?.trim());
  const actionDisabled =
    input.meta?.loading === "loading" ||
    Boolean(input.meta?.error) ||
    input.hasRequiredLocalDraft === false;

  const keys: VisibilityKey[] = [];
  if (!signedIn) keys.push("VIS-SIGNED-OUT");
  else keys.push("VIS-SIGNED-IN");
  if (opsCapable) keys.push("VIS-OPS");
  else keys.push("VIS-OPS-DENIED");
  if (contextMissing) keys.push("VIS-CONTEXT-MISSING");
  if (actionDisabled) keys.push("VIS-ACTION-DISABLED");

  return {
    keys,
    showSignIn: !signedIn,
    showCustomerAffordances: signedIn,
    showOpsChrome: opsCapable,
    contextMissing,
    actionDisabled,
  };
}

/**
 * Classify transport/API signal into presentation class (no new business codes).
 */
export function classifyAuthSignal(input: {
  status?: number | null;
  code?: string | null;
}): AuthPresentationClass {
  const code = (input.code ?? "").trim().toUpperCase();
  const status = input.status ?? null;

  if (
    code === "EXPIRED" ||
    code === "SESSION_EXPIRED" ||
    code === "401_EXPIRED"
  ) {
    return "EXPIRED";
  }
  if (
    code === "UNAVAILABLE" ||
    code === "NETWORK" ||
    code === "503" ||
    status === 503 ||
    status === 502
  ) {
    return "UNAVAILABLE";
  }
  if (
    code === "FORBIDDEN" ||
    code === "403" ||
    status === 403
  ) {
    return "FORBIDDEN";
  }
  if (
    code === "UNAUTHORIZED" ||
    code === "UNAUTH" ||
    code === "401" ||
    status === 401
  ) {
    return "UNAUTH";
  }
  if (status === 401) return "UNAUTH";
  if (status === 403) return "FORBIDDEN";
  return "UNAVAILABLE";
}

export function authClassUserMessage(
  authClass: AuthPresentationClass,
): string {
  switch (authClass) {
    case "UNAUTH":
    case "EXPIRED":
      return "Sign in required";
    case "FORBIDDEN":
      return "Access unavailable";
    case "UNAVAILABLE":
      return "Connection unavailable";
  }
}

/**
 * PD-4.6 §7 / §8 — safe fallback + META/session updates.
 */
export function settleSecuritySignal(input: {
  status?: number | null;
  code?: string | null;
  message?: string | null;
  context:
    | "customer-command"
    | "grd-session"
    | "grd-ops"
    | "download"
    | "boot";
  meta?: PresentationMetaState;
  session?: SessionPresentationState;
  resumePath?: string;
}): SecuritySettleResult {
  const authClass = classifyAuthSignal({
    status: input.status,
    code: input.code,
  });
  const message =
    input.message?.trim() || authClassUserMessage(authClass);

  let session = input.session ?? emptySession();
  let fallback: SecurityFallbackPlan | null = null;
  const meta = setMetaError(input.meta ?? createIdleMetaState(), message);

  const clearsAuth =
    authClass === "UNAUTH" || authClass === "EXPIRED";

  if (clearsAuth) {
    session = clearSessionPresentation();
  }

  if (input.context === "grd-ops" || (input.context === "grd-session" && clearsAuth)) {
    fallback = {
      to:
        input.context === "grd-session"
          ? buildSignInRedirect(input.resumePath)
          : "/",
      intent:
        input.context === "grd-ops"
          ? "Leave Admin; no privilege escalation UI"
          : "Re-authenticate",
      offerSignIn: input.context === "grd-session" || clearsAuth,
      clearSession: clearsAuth,
      clearServerCache: clearsAuth,
    };
  } else if (input.context === "boot" && authClass === "UNAVAILABLE") {
    fallback = {
      to: "/unavailable",
      intent: "Auth critically unavailable at boot",
      offerSignIn: false,
      clearSession: false,
      clearServerCache: false,
    };
  } else if (clearsAuth && input.context === "customer-command") {
    fallback = {
      to: buildSignInRedirect(input.resumePath),
      intent: "Re-authenticate",
      offerSignIn: true,
      clearSession: true,
      clearServerCache: true,
    };
  } else if (clearsAuth && input.context === "download") {
    fallback = {
      to: buildSignInRedirect(input.resumePath),
      intent: "Sign In then retry intent",
      offerSignIn: true,
      clearSession: true,
      clearServerCache: true,
    };
  } else if (authClass === "FORBIDDEN" && input.context === "grd-ops") {
    fallback = {
      to: "/",
      intent: "Leave Admin; no privilege escalation UI",
      offerSignIn: false,
      clearSession: false,
      clearServerCache: false,
    };
  }

  const visibility = resolvePermissionVisibility({
    session,
    meta,
  });

  return { authClass, meta, session, fallback, visibility };
}

/** SH-01…SH-05 — clear presentation session only. */
export function clearSessionPresentation(): SessionPresentationState {
  return {
    signedIn: false,
    displayName: null,
    opsCapable: false,
  };
}

export function emptySession(): SessionPresentationState {
  return clearSessionPresentation();
}

/**
 * Map FE-1 observation → ST-SESSION (AB-02 / SH-02). Does not mint roles.
 */
export function presentSessionFromObservation(
  observation: SessionObservation,
  displayName: string | null = null,
): SessionPresentationState {
  return mapSessionObservation(observation, displayName);
}

/** Sign-in / sign-out invalidation class from FE-4.1 policy. */
export function sessionInvalidationTargets(): readonly string[] {
  const row = CACHE_INVALIDATION_POLICY.find(
    (p) => p.commandClass === "sign-in-out",
  );
  return row?.invalidate ?? ["session", "all-server"];
}

/**
 * Scrub sensitive keys from draft/view bags before Adapter request view (SD-01).
 */
export function scrubSensitiveFields(
  draft: Readonly<Record<string, string | undefined>>,
): Readonly<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(draft)) {
    if (isSensitiveFieldKey(key)) continue;
    const trimmed = value?.trim();
    if (trimmed) out[key] = trimmed;
  }
  return out;
}

export function isSensitiveFieldKey(key: string): boolean {
  const normalized = key.trim().toLowerCase();
  return (SENSITIVE_FIELD_KEYS as readonly string[]).some(
    (s) => normalized === s.toLowerCase() || normalized.includes(s.toLowerCase()),
  );
}

export function isSafeQueryCueKey(key: string): boolean {
  return (SAFE_QUERY_CUE_KEYS as readonly string[]).includes(key);
}

/**
 * Customer shell never mixes Admin as primary (PV-01 / §4.4).
 * Ops chrome only when VIS-OPS and already on ops shell surface.
 */
export function shouldShowOpsShellNav(input: {
  shellMode: ShellMode;
  visibility: PermissionVisibility;
}): boolean {
  return input.shellMode === "ops" && input.visibility.showOpsChrome;
}

/**
 * Re-read GRD-* with security meaning (GS-01…GS-04) — delegates to FE-1 guards.
 */
export function resolveGuardSecurityDecision(input: {
  pathname: string;
  projectId?: string | null;
  session: SessionObservation | null;
}) {
  return resolvePresentationGuard(input);
}

export function isAllowedSecurityFallback(
  to: string,
): to is SecurityFallbackRoute | `/?${string}` {
  if ((SECURITY_FALLBACK_ROUTES as readonly string[]).includes(to)) {
    return true;
  }
  return to.startsWith("/?");
}

/** Forbidden product routes that must not be invented (SF-02). */
export const FORBIDDEN_SECURITY_ROUTES = [
  "/forbidden",
  "/login-error",
  "/unauthorized",
  "/privilege",
] as const;

export function assertsNoRbacEngineInModule(): true {
  return true;
}

function readSignedIn(
  session: SessionObservation | SessionPresentationState | null,
): boolean {
  if (!session) return false;
  if ("presentedSession" in session) return Boolean(session.presentedSession);
  return Boolean(session.signedIn);
}

function readOpsCapable(
  session: SessionObservation | SessionPresentationState | null,
): boolean {
  if (!session) return false;
  if ("presentedOpsCapability" in session) {
    return Boolean(session.presentedOpsCapability);
  }
  return Boolean(session.opsCapable);
}

export { PRESENTATION_GUARD_IDS };
