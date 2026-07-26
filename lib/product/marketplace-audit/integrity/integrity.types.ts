/**
 * Product Marketplace Audit — Integrity types
 */

import type { MARKETPLACE_AUDIT_INTEGRITY_VERDICTS } from "../management/management.constants";

export type MarketplaceAuditIntegrityVerdict =
  (typeof MARKETPLACE_AUDIT_INTEGRITY_VERDICTS)[number];
export type IntegrityMetadata = Record<string, unknown>;

export type MarketplaceAuditIntegrity = {
  id: string;
  trailId: string;
  checksum: string;
  verdict: MarketplaceAuditIntegrityVerdict;
  detail: string;
  metadata: IntegrityMetadata;
  createdAt: string;
};

export type SealMarketplaceAuditIntegrityInput = {
  id?: string;
  trailId: string;
  metadata?: IntegrityMetadata;
};
