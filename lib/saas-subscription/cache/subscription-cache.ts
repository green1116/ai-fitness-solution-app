import type { TenantEntitlements } from "../shared/subscription-types";

const entitlementCache = new Map<string, TenantEntitlements>();

export function getTenantEntitlementsFromCache(tenantId: string): TenantEntitlements | undefined {
  const cached = entitlementCache.get(tenantId);
  return cached ? { ...cached, features: { ...cached.features }, quotas: { ...cached.quotas } } : undefined;
}

export function setTenantEntitlementsCache(tenantId: string, entitlements: TenantEntitlements): void {
  entitlementCache.set(tenantId, {
    ...entitlements,
    features: { ...entitlements.features },
    quotas: { ...entitlements.quotas },
  });
}

export function deleteTenantEntitlementsCache(tenantId: string): void {
  entitlementCache.delete(tenantId);
}

export function clearSubscriptionCache(): void {
  entitlementCache.clear();
}

export function getSubscriptionCacheSize(): number {
  return entitlementCache.size;
}
