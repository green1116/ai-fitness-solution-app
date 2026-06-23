/**
 * V61 — Portal access guard for API routes
 */

import type { PortalUserContext } from "@/lib/portal/v57/auth-context";
import {
  canAccessSurface,
  normalizePortalRole,
  PortalAccessError,
  type PortalSurface,
} from "./portal-rbac";

export function requirePortalAuth(ctx: PortalUserContext | null): PortalUserContext {
  if (!ctx?.organizationId) {
    const err = new Error("AUTH_REQUIRED");
    (err as Error & { status: number }).status = 401;
    throw err;
  }
  return ctx;
}

export function requirePortalSurface(
  ctx: PortalUserContext,
  surface: PortalSurface,
): PortalUserContext {
  const role = ctx.membership?.role ?? "MEMBER";
  if (!canAccessSurface(role, surface)) {
    throw new PortalAccessError(surface, normalizePortalRole(role));
  }
  return ctx;
}

export function isAuthRequiredError(err: unknown): boolean {
  return err instanceof Error && err.message === "AUTH_REQUIRED";
}

export function isPortalAccessError(err: unknown): err is PortalAccessError {
  return err instanceof PortalAccessError;
}
