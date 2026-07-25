/**
 * Product Subscription — Entitlement types
 */

import type { ENTITLEMENT_STATUSES } from "../lifecycle/lifecycle.constants";

export type EntitlementStatus = (typeof ENTITLEMENT_STATUSES)[number];
export type EntitlementMetadata = Record<string, unknown>;

export type SubscriptionEntitlement = {
  id: string;
  subscriptionId: string;
  featureKey: string;
  status: EntitlementStatus;
  detail: string;
  metadata: EntitlementMetadata;
  grantedAt: string;
  revokedAt?: string;
};

export type GrantEntitlementInput = {
  id?: string;
  subscriptionId: string;
  featureKey: string;
  metadata?: EntitlementMetadata;
};

export type RevokeEntitlementInput = {
  entitlementId: string;
};
