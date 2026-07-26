/**
 * Product Marketplace Audit — readiness / manifest types
 */

import type {
  MARKETPLACE_AUDIT_MANAGER_STATUSES,
  MARKETPLACE_AUDIT_READINESS_VERDICTS,
  PRODUCT_MARKETPLACE_AUDIT_BASE,
  PRODUCT_MARKETPLACE_AUDIT_FREEZE_VERSION,
  PRODUCT_MARKETPLACE_AUDIT_ID,
  PRODUCT_MARKETPLACE_AUDIT_VERSION,
} from "./management.constants";

export type MarketplaceAuditReadinessVerdict =
  (typeof MARKETPLACE_AUDIT_READINESS_VERDICTS)[number];
export type MarketplaceAuditManagerStatus =
  (typeof MARKETPLACE_AUDIT_MANAGER_STATUSES)[number];

export type MarketplaceAuditReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type MarketplaceAuditReadinessResult = {
  verdict: MarketplaceAuditReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: MarketplaceAuditReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type MarketplaceAuditRegistryManifest = {
  auditId: typeof PRODUCT_MARKETPLACE_AUDIT_ID;
  version: typeof PRODUCT_MARKETPLACE_AUDIT_VERSION;
  freezeVersion: typeof PRODUCT_MARKETPLACE_AUDIT_FREEZE_VERSION;
  base: typeof PRODUCT_MARKETPLACE_AUDIT_BASE;
  eventCount: number;
  trailCount: number;
  queryCount: number;
  integrityCount: number;
  releaseCount: number;
};
