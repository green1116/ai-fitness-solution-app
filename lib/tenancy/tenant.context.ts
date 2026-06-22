/**
 * V59.5 — Tenant context (AsyncLocalStorage for request-scoped isolation)
 */

import { AsyncLocalStorage } from "node:async_hooks";

export type TenantContext = {
  organizationId: string;
  userId: string;
  traceId: string;
};

const tenantStorage = new AsyncLocalStorage<TenantContext>();

export function runWithTenantContext<T>(ctx: TenantContext, fn: () => T): T {
  return tenantStorage.run(ctx, fn);
}

export function getTenantContext(): TenantContext | undefined {
  return tenantStorage.getStore();
}

export function requireTenantContext(): TenantContext {
  const ctx = getTenantContext();
  if (!ctx) {
    throw new Error("Tenant context not bound to request");
  }
  return ctx;
}

export function getScopedOrganizationId(): string {
  return requireTenantContext().organizationId;
}
