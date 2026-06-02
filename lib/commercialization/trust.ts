/**
 * V3.6 commercial trust foundation compat entry.
 * Minimal pass-through for engine.ts module resolution.
 */

import type { CommercialSupportFoundationResult } from "./support";

export const COMMERCIAL_TRUST_FOUNDATION_VERSION = "3.6-trust-1" as const;

export type CommercialTrustFoundationInput = {
  deploymentId: string;
  support: CommercialSupportFoundationResult;
};

export type CommercialTrustFoundationResult = {
  version: typeof COMMERCIAL_TRUST_FOUNDATION_VERSION;
  deploymentId: string;
  trustReady: boolean;
  summary: string;
  trustCenterSummary: string;
  securityPostureSummary: string;
  privacyNoticeSummary: string;
  legalNoticeSummary: string;
};

/** Minimal trust compat: trust center + security/privacy/legal notices. */
export function runCommercialTrustFoundation(
  input: CommercialTrustFoundationInput,
): CommercialTrustFoundationResult {
  const summary = [
    `trust=${COMMERCIAL_TRUST_FOUNDATION_VERSION}`,
    `deploymentId=${input.deploymentId}`,
    `trust-ready=true`,
    input.support.summary ? `support=${input.support.summary}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    version: COMMERCIAL_TRUST_FOUNDATION_VERSION,
    deploymentId: input.deploymentId,
    trustReady: true,
    summary,
    trustCenterSummary: `trust-center-ready=${COMMERCIAL_TRUST_FOUNDATION_VERSION}`,
    securityPostureSummary: `security-posture-ready=${COMMERCIAL_TRUST_FOUNDATION_VERSION}`,
    privacyNoticeSummary: `privacy-notice-ready=${COMMERCIAL_TRUST_FOUNDATION_VERSION}`,
    legalNoticeSummary: `legal-notice-ready=${COMMERCIAL_TRUST_FOUNDATION_VERSION}`,
  };
}

export function formatTrustCenterReadyHook(
  result: CommercialTrustFoundationResult,
): string {
  return result.trustCenterSummary;
}

export function formatSecurityPostureReadyHook(
  result: CommercialTrustFoundationResult,
): string {
  return result.securityPostureSummary;
}

export function formatPrivacyNoticeReadyHook(
  result: CommercialTrustFoundationResult,
): string {
  return result.privacyNoticeSummary;
}

export function formatLegalNoticeReadyHook(
  result: CommercialTrustFoundationResult,
): string {
  return result.legalNoticeSummary;
}
