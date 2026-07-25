/**
 * Product Admin Audit — readiness / manifest types
 */

import type {
  ADMIN_AUDIT_MANAGER_STATUSES,
  ADMIN_AUDIT_READINESS_VERDICTS,
  PRODUCT_ADMIN_AUDIT_BASE,
  PRODUCT_ADMIN_AUDIT_FREEZE_VERSION,
  PRODUCT_ADMIN_AUDIT_ID,
  PRODUCT_ADMIN_AUDIT_VERSION,
} from "./traceability.constants";

export type AdminAuditReadinessVerdict =
  (typeof ADMIN_AUDIT_READINESS_VERDICTS)[number];
export type AdminAuditManagerStatus =
  (typeof ADMIN_AUDIT_MANAGER_STATUSES)[number];

export type AdminAuditReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type AdminAuditReadinessResult = {
  verdict: AdminAuditReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: AdminAuditReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type AdminAuditRegistryManifest = {
  foundationId: typeof PRODUCT_ADMIN_AUDIT_ID;
  version: typeof PRODUCT_ADMIN_AUDIT_VERSION;
  freezeVersion: typeof PRODUCT_ADMIN_AUDIT_FREEZE_VERSION;
  base: typeof PRODUCT_ADMIN_AUDIT_BASE;
  eventCount: number;
  trailCount: number;
  sealCount: number;
  queryCount: number;
};
