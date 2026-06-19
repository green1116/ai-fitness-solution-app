export function isValidEntitlementFeature(feature: string): boolean {
  return feature.trim().length >= 3 && feature.trim().length <= 120;
}

export function assertEntitlementQuota(quota: number | null | undefined): boolean {
  if (quota == null) return true;
  return Number.isInteger(quota) && quota >= 0;
}
