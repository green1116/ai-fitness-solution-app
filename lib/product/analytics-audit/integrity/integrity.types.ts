/**
 * Product Analytics Audit — Integrity types
 */

import type { ANALYTICS_INTEGRITY_RESULTS } from "../traceability/traceability.constants";

export type AnalyticsIntegrityResult =
  (typeof ANALYTICS_INTEGRITY_RESULTS)[number];
export type SealMetadata = Record<string, unknown>;

export type AnalyticsAuditSeal = {
  id: string;
  trailId: string;
  digest: string;
  result: AnalyticsIntegrityResult;
  detail: string;
  metadata: SealMetadata;
  sealedAt: string;
};

export type SealAnalyticsTrailInput = {
  id?: string;
  trailId: string;
  metadata?: SealMetadata;
};

export type VerifyAnalyticsSealInput = {
  sealId: string;
  expectedDigest?: string;
};
