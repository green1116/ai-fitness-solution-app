/**
 * Product Billing Audit — Integrity types
 */

import type { BILLING_INTEGRITY_RESULTS } from "../traceability/traceability.constants";

export type BillingIntegrityResult =
  (typeof BILLING_INTEGRITY_RESULTS)[number];
export type SealMetadata = Record<string, unknown>;

export type BillingAuditSeal = {
  id: string;
  trailId: string;
  digest: string;
  result: BillingIntegrityResult;
  detail: string;
  metadata: SealMetadata;
  sealedAt: string;
};

export type SealBillingTrailInput = {
  id?: string;
  trailId: string;
  metadata?: SealMetadata;
};

export type VerifyBillingSealInput = {
  sealId: string;
  expectedDigest?: string;
};
