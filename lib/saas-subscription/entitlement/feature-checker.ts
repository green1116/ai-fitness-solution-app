import type { TenantEntitlements } from "../shared/subscription-types";

export function hasFeature(entitlements: TenantEntitlements, feature: string): boolean {
  return Boolean(entitlements.features[feature]);
}
