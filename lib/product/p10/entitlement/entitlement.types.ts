/**
 * Product P10 — Entitlement types
 */

import type { ENTITLEMENT_KINDS } from "../subscription/subscription.constants";

export type EntitlementKind = (typeof ENTITLEMENT_KINDS)[number];
export type EntitlementMetadata = Record<string, unknown>;

export type Entitlement = {
  id: string;
  subscriptionId: string;
  kind: EntitlementKind;
  code: string;
  enabled: boolean;
  detail: string;
  metadata: EntitlementMetadata;
  grantedAt: string;
};

export type GrantEntitlementInput = {
  id?: string;
  subscriptionId: string;
  kind: EntitlementKind;
  code: string;
  enabled?: boolean;
  metadata?: EntitlementMetadata;
};
