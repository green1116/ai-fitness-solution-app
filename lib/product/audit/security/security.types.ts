/**
 * Product Audit — readiness / manifest types
 */

import type {
  AUDIT_MANAGER_STATUSES,
  AUDIT_READINESS_VERDICTS,
  PRODUCT_AUDIT_TRACEABILITY_BASE,
  PRODUCT_AUDIT_TRACEABILITY_FREEZE_VERSION,
  PRODUCT_AUDIT_TRACEABILITY_ID,
  PRODUCT_AUDIT_TRACEABILITY_VERSION,
} from "./security.constants";

export type AuditReadinessVerdict =
  (typeof AUDIT_READINESS_VERDICTS)[number];
export type AuditManagerStatus = (typeof AUDIT_MANAGER_STATUSES)[number];

export type AuditReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type AuditReadinessResult = {
  verdict: AuditReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: AuditReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type AuditRegistryManifest = {
  foundationId: typeof PRODUCT_AUDIT_TRACEABILITY_ID;
  version: typeof PRODUCT_AUDIT_TRACEABILITY_VERSION;
  freezeVersion: typeof PRODUCT_AUDIT_TRACEABILITY_FREEZE_VERSION;
  base: typeof PRODUCT_AUDIT_TRACEABILITY_BASE;
  eventCount: number;
  trailCount: number;
  sealCount: number;
  queryCount: number;
};
