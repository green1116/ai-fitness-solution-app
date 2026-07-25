/**
 * Product Admin Audit — Integrity types
 */

import type { ADMIN_INTEGRITY_RESULTS } from "../traceability/traceability.constants";

export type AdminIntegrityResult = (typeof ADMIN_INTEGRITY_RESULTS)[number];
export type SealMetadata = Record<string, unknown>;

export type AdminAuditSeal = {
  id: string;
  trailId: string;
  digest: string;
  result: AdminIntegrityResult;
  detail: string;
  metadata: SealMetadata;
  sealedAt: string;
};

export type SealAdminTrailInput = {
  id?: string;
  trailId: string;
  metadata?: SealMetadata;
};

export type VerifyAdminSealInput = {
  sealId: string;
  expectedDigest?: string;
};
