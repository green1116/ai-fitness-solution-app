/**
 * V59.5 — Resolve tenant (organization) from authenticated request context
 */

import type { NextRequest } from "next/server";

import { extractOrganizationId } from "@/lib/auth/auth.service";
import type { AuthContext } from "@/lib/auth/auth.service";

export type ResolvedTenant = {
  organizationId: string;
  userId: string;
  source: "header" | "body";
};

export function resolveTenantFromRequest(
  req: NextRequest,
  auth: AuthContext,
  body?: Record<string, unknown>,
): ResolvedTenant {
  const headerOrg = req.headers.get("x-organization-id")?.trim();
  const bodyOrg =
    typeof body?.organizationId === "string" ? body.organizationId.trim() : null;
  const resolved = extractOrganizationId(req, body);

  if (!resolved) {
    throw new TenantResolutionError("Organization context required");
  }

  if (resolved !== auth.organizationId) {
    throw new TenantResolutionError("Organization context mismatch with membership");
  }

  return {
    organizationId: resolved,
    userId: auth.userId,
    source: headerOrg ? "header" : bodyOrg ? "body" : "header",
  };
}

export class TenantResolutionError extends Error {
  readonly code = "TENANT_RESOLUTION_FAILED";
  readonly status = 403;

  constructor(message: string) {
    super(message);
    this.name = "TenantResolutionError";
  }
}
