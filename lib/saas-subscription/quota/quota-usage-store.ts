const usageRegistry = new Map<string, Map<string, number>>();

export function getQuotaUsage(tenantId: string, quotaKey: string): number {
  const tenantUsage = usageRegistry.get(tenantId);
  return tenantUsage?.get(quotaKey) ?? 0;
}

export function incrementQuotaUsage(tenantId: string, quotaKey: string, amount: number): number {
  const tenantUsage = usageRegistry.get(tenantId) ?? new Map<string, number>();
  const next = (tenantUsage.get(quotaKey) ?? 0) + amount;
  tenantUsage.set(quotaKey, next);
  usageRegistry.set(tenantId, tenantUsage);
  return next;
}

export function clearQuotaUsage(): void {
  usageRegistry.clear();
}

export function resetTenantQuotaUsage(tenantId: string): void {
  usageRegistry.delete(tenantId);
}
