/**
 * Product API Portal — readiness / manifest types
 */

import type {
  PORTAL_MANAGER_STATUSES,
  PORTAL_READINESS_VERDICTS,
  PRODUCT_API_PORTAL_BASE,
  PRODUCT_API_PORTAL_FREEZE_VERSION,
  PRODUCT_API_PORTAL_ID,
  PRODUCT_API_PORTAL_VERSION,
} from "./management.constants";

export type PortalReadinessVerdict =
  (typeof PORTAL_READINESS_VERDICTS)[number];
export type PortalManagerStatus = (typeof PORTAL_MANAGER_STATUSES)[number];

export type PortalReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type PortalReadinessResult = {
  verdict: PortalReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: PortalReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type PortalRegistryManifest = {
  portalLayerId: typeof PRODUCT_API_PORTAL_ID;
  version: typeof PRODUCT_API_PORTAL_VERSION;
  freezeVersion: typeof PRODUCT_API_PORTAL_FREEZE_VERSION;
  base: typeof PRODUCT_API_PORTAL_BASE;
  portalCount: number;
  docCount: number;
  catalogCount: number;
  surfaceCount: number;
  releaseCount: number;
};
