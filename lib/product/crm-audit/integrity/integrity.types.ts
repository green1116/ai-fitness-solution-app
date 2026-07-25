/**
 * Product CRM Audit — Integrity types
 */

import type { CRM_INTEGRITY_RESULTS } from "../traceability/traceability.constants";

export type CrmIntegrityResult = (typeof CRM_INTEGRITY_RESULTS)[number];
export type SealMetadata = Record<string, unknown>;

export type CrmAuditSeal = {
  id: string;
  trailId: string;
  digest: string;
  result: CrmIntegrityResult;
  detail: string;
  metadata: SealMetadata;
  sealedAt: string;
};

export type SealCrmTrailInput = {
  id?: string;
  trailId: string;
  metadata?: SealMetadata;
};

export type VerifyCrmSealInput = {
  sealId: string;
  expectedDigest?: string;
};
