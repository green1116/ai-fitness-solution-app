/**
 * V59.5 — Tenant isolation guard (prevents cross-tenant data access)
 */

import type { AuthContext } from "@/lib/auth/auth.service";
import { runWithTenantContext, type TenantContext } from "@/lib/tenancy/tenant.context";
import { resolveTenantFromRequest, TenantResolutionError } from "@/lib/tenancy/tenant.resolver";
import type { NextRequest } from "next/server";

export class TenantIsolationError extends Error {
  readonly code = "TENANT_ISOLATION";
  readonly status = 403;

  constructor(message: string) {
    super(message);
    this.name = "TenantIsolationError";
  }
}

export type TenantGuardResult = TenantContext & {
  organizationId: string;
  userId: string;
};

export function enforceTenantScope(
  req: NextRequest,
  auth: AuthContext,
  traceId: string,
  body?: Record<string, unknown>,
): TenantGuardResult {
  try {
    const tenant = resolveTenantFromRequest(req, auth, body);
    const ctx: TenantContext = {
      organizationId: tenant.organizationId,
      userId: tenant.userId,
      traceId,
    };
    return { ...ctx, organizationId: tenant.organizationId, userId: tenant.userId };
  } catch (err) {
    if (err instanceof TenantResolutionError) {
      throw new TenantIsolationError(err.message);
    }
    throw err;
  }
}

export function assertResourceBelongsToTenant(
  resourceOrganizationId: string | null | undefined,
  tenantOrganizationId: string,
): void {
  if (!resourceOrganizationId || resourceOrganizationId !== tenantOrganizationId) {
    throw new TenantIsolationError("Cross-tenant resource access denied");
  }
}

export function withTenantScope<T>(
  ctx: TenantContext,
  fn: () => T | Promise<T>,
): T | Promise<T> {
  return runWithTenantContext(ctx, fn);
}

export { TenantResolutionError };
