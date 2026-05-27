/**
 * V3.6 commercial transparency foundation compat entry.
 * Minimal pass-through for engine.ts module resolution.
 */

import type { CommercialReleaseFoundationResult } from "./release";
import type { CommercialTrustFoundationResult } from "./trust";

export const COMMERCIAL_TRANSPARENCY_FOUNDATION_VERSION = "3.6-transparency-1" as const;

export type CommercialTransparencyFoundationInput = {
  deploymentId: string;
  release: CommercialReleaseFoundationResult;
  trust: CommercialTrustFoundationResult;
};

export type CommercialTransparencyFoundationResult = {
  version: typeof COMMERCIAL_TRANSPARENCY_FOUNDATION_VERSION;
  deploymentId: string;
  transparencyReady: boolean;
  summary: string;
  transparencyCenterSummary: string;
  publicAuditSummary: string;
  publicReportingSummary: string;
  metricsSnapshotSummary: string;
};

/** Minimal transparency compat: center + audit/reporting/metrics hooks. */
export function runCommercialTransparencyFoundation(
  input: CommercialTransparencyFoundationInput,
): CommercialTransparencyFoundationResult {
  const summary = [
    `transparency=${COMMERCIAL_TRANSPARENCY_FOUNDATION_VERSION}`,
    `deploymentId=${input.deploymentId}`,
    `transparency-ready=true`,
    input.release.summary ? `release=${input.release.summary}` : null,
    input.trust.summary ? `trust=${input.trust.summary}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    version: COMMERCIAL_TRANSPARENCY_FOUNDATION_VERSION,
    deploymentId: input.deploymentId,
    transparencyReady: true,
    summary,
    transparencyCenterSummary: `transparency-center-ready=${COMMERCIAL_TRANSPARENCY_FOUNDATION_VERSION}`,
    publicAuditSummary: `public-audit-ready=${COMMERCIAL_TRANSPARENCY_FOUNDATION_VERSION}`,
    publicReportingSummary: `public-reporting-ready=${COMMERCIAL_TRANSPARENCY_FOUNDATION_VERSION}`,
    metricsSnapshotSummary: `metrics-snapshot-ready=${COMMERCIAL_TRANSPARENCY_FOUNDATION_VERSION}`,
  };
}

export function formatTransparencyCenterReadyHook(
  result: CommercialTransparencyFoundationResult,
): string {
  return result.transparencyCenterSummary;
}

export function formatPublicAuditReadyHook(
  result: CommercialTransparencyFoundationResult,
): string {
  return result.publicAuditSummary;
}

export function formatPublicReportingReadyHook(
  result: CommercialTransparencyFoundationResult,
): string {
  return result.publicReportingSummary;
}

export function formatMetricsSnapshotReadyHook(
  result: CommercialTransparencyFoundationResult,
): string {
  return result.metricsSnapshotSummary;
}
