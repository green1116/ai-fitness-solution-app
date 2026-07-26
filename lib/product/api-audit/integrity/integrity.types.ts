/**
 * Product API Audit — Integrity types
 */

import type { API_AUDIT_INTEGRITY_VERDICTS } from "../management/management.constants";

export type ApiAuditIntegrityVerdict =
  (typeof API_AUDIT_INTEGRITY_VERDICTS)[number];
export type IntegrityMetadata = Record<string, unknown>;

export type ApiAuditIntegrity = {
  id: string;
  trailId: string;
  checksum: string;
  verdict: ApiAuditIntegrityVerdict;
  detail: string;
  metadata: IntegrityMetadata;
  createdAt: string;
};

export type SealApiAuditIntegrityInput = {
  id?: string;
  trailId: string;
  metadata?: IntegrityMetadata;
};
