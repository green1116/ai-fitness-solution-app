/**
 * Product Billing Audit — readiness / manifest types
 */

import type {
  BILLING_AUDIT_MANAGER_STATUSES,
  BILLING_AUDIT_READINESS_VERDICTS,
  PRODUCT_BILLING_AUDIT_BASE,
  PRODUCT_BILLING_AUDIT_FREEZE_VERSION,
  PRODUCT_BILLING_AUDIT_ID,
  PRODUCT_BILLING_AUDIT_VERSION,
} from "./traceability.constants";

export type BillingAuditReadinessVerdict =
  (typeof BILLING_AUDIT_READINESS_VERDICTS)[number];
export type BillingAuditManagerStatus =
  (typeof BILLING_AUDIT_MANAGER_STATUSES)[number];

export type BillingAuditReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type BillingAuditReadinessResult = {
  verdict: BillingAuditReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: BillingAuditReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type BillingAuditRegistryManifest = {
  foundationId: typeof PRODUCT_BILLING_AUDIT_ID;
  version: typeof PRODUCT_BILLING_AUDIT_VERSION;
  freezeVersion: typeof PRODUCT_BILLING_AUDIT_FREEZE_VERSION;
  base: typeof PRODUCT_BILLING_AUDIT_BASE;
  eventCount: number;
  trailCount: number;
  sealCount: number;
  queryCount: number;
};
