import type { PresentationRoutePath } from "./presentation-routes";

export const PRESENTATION_GUARD_IDS = [
  "GRD-NONE",
  "GRD-SESSION",
  "GRD-CONTEXT",
  "GRD-OPS",
  "GRD-ALIAS",
] as const;

export type PresentationGuardId = (typeof PRESENTATION_GUARD_IDS)[number];

export type GuardDecision =
  | { action: "allow" }
  | { action: "redirect"; to: "/" | `/?${string}`; reason: PresentationGuardId }
  | { action: "soft-context"; reason: "GRD-CONTEXT" }
  | { action: "observe" };

export type SessionObservation = Readonly<{
  presentedSession: boolean;
  presentedOpsCapability: boolean;
}>;

type GuardRouteRule = Readonly<{
  path: PresentationRoutePath;
  guards: readonly PresentationGuardId[];
}>;

/**
 * PD-4.2 §6.1 — presentation-only guard catalogue by route.
 * No Domain eligibility scoring beyond session/ops observation inputs.
 */
export const GUARD_ROUTE_RULES = [
  { path: "/", guards: ["GRD-NONE"] },
  { path: "/home", guards: ["GRD-NONE", "GRD-ALIAS"] },
  { path: "/404", guards: ["GRD-NONE"] },
  { path: "/unavailable", guards: ["GRD-NONE"] },
  { path: "/builder", guards: ["GRD-SESSION"] },
  { path: "/tender", guards: ["GRD-SESSION"] },
  { path: "/workspace", guards: ["GRD-SESSION", "GRD-CONTEXT"] },
  { path: "/solution", guards: ["GRD-SESSION", "GRD-CONTEXT"] },
  { path: "/budget", guards: ["GRD-SESSION", "GRD-CONTEXT"] },
  { path: "/projects", guards: ["GRD-SESSION"] },
  { path: "/documents", guards: ["GRD-SESSION", "GRD-CONTEXT"] },
  { path: "/admin", guards: ["GRD-OPS"] },
] as const satisfies readonly GuardRouteRule[];

export function getGuardsForPath(pathname: string): readonly PresentationGuardId[] {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  const rule = GUARD_ROUTE_RULES.find((entry) => entry.path === normalized);
  return rule?.guards ?? ["GRD-NONE"];
}

export function requiresSessionObservation(pathname: string): boolean {
  const guards = getGuardsForPath(pathname);
  return guards.includes("GRD-SESSION") || guards.includes("GRD-OPS");
}

export function buildSignInRedirect(resumePath?: string): `/?${string}` {
  const params = new URLSearchParams({ signin: "1" });
  if (resumePath && resumePath !== "/" && resumePath !== "/home") {
    params.set("next", resumePath);
  }
  return `/?${params.toString()}`;
}

/**
 * Pure presentation guard resolution.
 * Consumes only observed session/ops presentation flags and route params.
 */
export function resolvePresentationGuard(input: {
  pathname: string;
  projectId?: string | null;
  session: SessionObservation | null;
}): GuardDecision {
  const guards = getGuardsForPath(input.pathname);

  if (guards.includes("GRD-ALIAS")) {
    return { action: "redirect", to: "/", reason: "GRD-ALIAS" };
  }

  if (guards.includes("GRD-NONE") && guards.length === 1) {
    return { action: "allow" };
  }

  const needsObservation =
    guards.includes("GRD-SESSION") || guards.includes("GRD-OPS");
  if (needsObservation && input.session === null) {
    return { action: "observe" };
  }

  if (guards.includes("GRD-OPS")) {
    if (!input.session?.presentedOpsCapability) {
      return { action: "redirect", to: "/", reason: "GRD-OPS" };
    }
    return { action: "allow" };
  }

  if (guards.includes("GRD-SESSION") && !input.session?.presentedSession) {
    return {
      action: "redirect",
      to: buildSignInRedirect(input.pathname),
      reason: "GRD-SESSION",
    };
  }

  if (guards.includes("GRD-CONTEXT")) {
    const projectId = input.projectId?.trim() ?? "";
    if (!projectId) {
      return { action: "soft-context", reason: "GRD-CONTEXT" };
    }
  }

  return { action: "allow" };
}
