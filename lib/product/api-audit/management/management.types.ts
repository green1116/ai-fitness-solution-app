/**
 * Product API Audit — readiness / manifest types
 */

import type {
  API_AUDIT_MANAGER_STATUSES,
  API_AUDIT_READINESS_VERDICTS,
  PRODUCT_API_AUDIT_BASE,
  PRODUCT_API_AUDIT_FREEZE_VERSION,
  PRODUCT_API_AUDIT_ID,
  PRODUCT_API_AUDIT_VERSION,
} from "./management.constants";

export type ApiAuditReadinessVerdict =
  (typeof API_AUDIT_READINESS_VERDICTS)[number];
export type ApiAuditManagerStatus =
  (typeof API_AUDIT_MANAGER_STATUSES)[number];

export type ApiAuditReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ApiAuditReadinessResult = {
  verdict: ApiAuditReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: ApiAuditReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type ApiAuditRegistryManifest = {
  auditId: typeof PRODUCT_API_AUDIT_ID;
  version: typeof PRODUCT_API_AUDIT_VERSION;
  freezeVersion: typeof PRODUCT_API_AUDIT_FREEZE_VERSION;
  base: typeof PRODUCT_API_AUDIT_BASE;
  eventCount: number;
  trailCount: number;
  queryCount: number;
  integrityCount: number;
  releaseCount: number;
};
