/**
 * Product Analytics Audit — readiness / manifest types
 */

import type {
  ANALYTICS_AUDIT_MANAGER_STATUSES,
  ANALYTICS_AUDIT_READINESS_VERDICTS,
  PRODUCT_ANALYTICS_AUDIT_BASE,
  PRODUCT_ANALYTICS_AUDIT_FREEZE_VERSION,
  PRODUCT_ANALYTICS_AUDIT_ID,
  PRODUCT_ANALYTICS_AUDIT_VERSION,
} from "./traceability.constants";

export type AnalyticsAuditReadinessVerdict =
  (typeof ANALYTICS_AUDIT_READINESS_VERDICTS)[number];
export type AnalyticsAuditManagerStatus =
  (typeof ANALYTICS_AUDIT_MANAGER_STATUSES)[number];

export type AnalyticsAuditReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type AnalyticsAuditReadinessResult = {
  verdict: AnalyticsAuditReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: AnalyticsAuditReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type AnalyticsAuditRegistryManifest = {
  foundationId: typeof PRODUCT_ANALYTICS_AUDIT_ID;
  version: typeof PRODUCT_ANALYTICS_AUDIT_VERSION;
  freezeVersion: typeof PRODUCT_ANALYTICS_AUDIT_FREEZE_VERSION;
  base: typeof PRODUCT_ANALYTICS_AUDIT_BASE;
  eventCount: number;
  trailCount: number;
  sealCount: number;
  queryCount: number;
};
