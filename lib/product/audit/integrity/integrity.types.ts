/**
 * Product Audit — Integrity types
 */

import type { AUDIT_INTEGRITY_RESULTS } from "../security/security.constants";

export type AuditIntegrityResult = (typeof AUDIT_INTEGRITY_RESULTS)[number];
export type SealMetadata = Record<string, unknown>;

export type AuditSeal = {
  id: string;
  trailId: string;
  digest: string;
  result: AuditIntegrityResult;
  detail: string;
  metadata: SealMetadata;
  sealedAt: string;
};

export type SealTrailInput = {
  id?: string;
  trailId: string;
  metadata?: SealMetadata;
};

export type VerifySealInput = {
  sealId: string;
  expectedDigest?: string;
};
