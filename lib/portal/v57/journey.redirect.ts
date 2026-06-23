/**
 * V57 P2 — Canonical user journey redirect helpers (Portal Wiring)
 */

export const WORKSPACE_DASHBOARD_PATH = "/dashboard";

export function resolvePostRegisterPath(): string {
  return "/onboarding";
}

export function resolvePostOnboardingPath(projectId: string): string {
  return `/quote?projectId=${encodeURIComponent(projectId)}`;
}

export function resolvePostQuotePath(quoteId?: string): string {
  if (quoteId) {
    return `${WORKSPACE_DASHBOARD_PATH}?quoteId=${encodeURIComponent(quoteId)}`;
  }
  return WORKSPACE_DASHBOARD_PATH;
}
