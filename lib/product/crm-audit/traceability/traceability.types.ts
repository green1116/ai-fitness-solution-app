/**
 * Product CRM Audit — readiness / manifest types
 */

import type {
  CRM_AUDIT_MANAGER_STATUSES,
  CRM_AUDIT_READINESS_VERDICTS,
  PRODUCT_CRM_AUDIT_BASE,
  PRODUCT_CRM_AUDIT_FREEZE_VERSION,
  PRODUCT_CRM_AUDIT_ID,
  PRODUCT_CRM_AUDIT_VERSION,
} from "./traceability.constants";

export type CrmAuditReadinessVerdict =
  (typeof CRM_AUDIT_READINESS_VERDICTS)[number];
export type CrmAuditManagerStatus =
  (typeof CRM_AUDIT_MANAGER_STATUSES)[number];

export type CrmAuditReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type CrmAuditReadinessResult = {
  verdict: CrmAuditReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: CrmAuditReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type CrmAuditRegistryManifest = {
  foundationId: typeof PRODUCT_CRM_AUDIT_ID;
  version: typeof PRODUCT_CRM_AUDIT_VERSION;
  freezeVersion: typeof PRODUCT_CRM_AUDIT_FREEZE_VERSION;
  base: typeof PRODUCT_CRM_AUDIT_BASE;
  eventCount: number;
  trailCount: number;
  sealCount: number;
  queryCount: number;
};
