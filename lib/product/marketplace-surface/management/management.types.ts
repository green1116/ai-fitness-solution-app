/**
 * Product Marketplace Surface — readiness / manifest types
 */

import type {
  PRODUCT_MARKETPLACE_SURFACE_BASE,
  PRODUCT_MARKETPLACE_SURFACE_FREEZE_VERSION,
  PRODUCT_MARKETPLACE_SURFACE_ID,
  PRODUCT_MARKETPLACE_SURFACE_VERSION,
  SURFACE_MANAGER_STATUSES,
  SURFACE_READINESS_VERDICTS,
} from "./management.constants";

export type SurfaceReadinessVerdict =
  (typeof SURFACE_READINESS_VERDICTS)[number];
export type SurfaceManagerStatus = (typeof SURFACE_MANAGER_STATUSES)[number];

export type SurfaceReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type SurfaceReadinessResult = {
  verdict: SurfaceReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: SurfaceReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type MarketplaceSurfaceRegistryManifest = {
  managementId: typeof PRODUCT_MARKETPLACE_SURFACE_ID;
  version: typeof PRODUCT_MARKETPLACE_SURFACE_VERSION;
  freezeVersion: typeof PRODUCT_MARKETPLACE_SURFACE_FREEZE_VERSION;
  base: typeof PRODUCT_MARKETPLACE_SURFACE_BASE;
  catalogCount: number;
  listingCount: number;
  visibilityCount: number;
  placementCount: number;
  releaseCount: number;
};
