/**
 * Product Marketplace — readiness / manifest types
 */

import type {
  MARKETPLACE_MANAGER_STATUSES,
  MARKETPLACE_READINESS_VERDICTS,
  PRODUCT_MARKETPLACE_FOUNDATION_BASE,
  PRODUCT_MARKETPLACE_FOUNDATION_FREEZE_VERSION,
  PRODUCT_MARKETPLACE_FOUNDATION_ID,
  PRODUCT_MARKETPLACE_FOUNDATION_VERSION,
} from "./management.constants";

export type MarketplaceReadinessVerdict =
  (typeof MARKETPLACE_READINESS_VERDICTS)[number];
export type MarketplaceManagerStatus =
  (typeof MARKETPLACE_MANAGER_STATUSES)[number];

export type MarketplaceReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type MarketplaceReadinessResult = {
  verdict: MarketplaceReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: MarketplaceReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type MarketplaceRegistryManifest = {
  foundationId: typeof PRODUCT_MARKETPLACE_FOUNDATION_ID;
  version: typeof PRODUCT_MARKETPLACE_FOUNDATION_VERSION;
  freezeVersion: typeof PRODUCT_MARKETPLACE_FOUNDATION_FREEZE_VERSION;
  base: typeof PRODUCT_MARKETPLACE_FOUNDATION_BASE;
  listingCount: number;
  definitionCount: number;
  versionCount: number;
  lifecycleCount: number;
  policyCount: number;
  releaseCount: number;
};
