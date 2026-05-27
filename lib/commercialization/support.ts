/** RC1 + V3.6 support compat entry — @/lib/commercialization/support */

import type { CommercialDiscoveryFoundationResult } from "./discovery";

export { runCommercialV37SupportFoundation } from "./_rc1-foundation-compat";

export const COMMERCIAL_SUPPORT_FOUNDATION_VERSION = "3.6-support-1" as const;

export type CommercialSupportFoundationInput = {
  deploymentId: string;
  discovery: CommercialDiscoveryFoundationResult;
  sampleFeedback?: { category: string; subject: string; body: string };
};

export type CommercialSupportFoundationResult = {
  version: typeof COMMERCIAL_SUPPORT_FOUNDATION_VERSION;
  deploymentId: string;
  summary: string;
  portalSummary: string;
  feedbackSummary: string;
  issueSummary: string;
};

type SummaryResult = { summary: string };

/** Minimal V3.6 support compat: portal + feedback/issue intake hooks. */
export function runCommercialSupportFoundation(
  input: CommercialSupportFoundationInput,
): CommercialSupportFoundationResult {
  const feedback = input.sampleFeedback?.category ?? "api";

  return {
    version: COMMERCIAL_SUPPORT_FOUNDATION_VERSION,
    deploymentId: input.deploymentId,
    summary: `support=${COMMERCIAL_SUPPORT_FOUNDATION_VERSION} deploymentId=${input.deploymentId} feedback=${feedback}`,
    portalSummary: `support-portal-ready=${COMMERCIAL_SUPPORT_FOUNDATION_VERSION}`,
    feedbackSummary: `feedback-intake-ready=${COMMERCIAL_SUPPORT_FOUNDATION_VERSION}`,
    issueSummary: `issue-intake-ready=${COMMERCIAL_SUPPORT_FOUNDATION_VERSION}`,
  };
}

export function formatSupportPortalReadyHook(
  result: CommercialSupportFoundationResult,
): string {
  return result.portalSummary;
}

export function formatFeedbackIntakeReadyHook(
  result: CommercialSupportFoundationResult,
): string {
  return result.feedbackSummary;
}

export function formatIssueIntakeReadyHook(
  result: CommercialSupportFoundationResult,
): string {
  return result.issueSummary;
}

export function formatSupportModelReadyHook(result: SummaryResult): string {
  return `support-model=${result.summary}`;
}

export function formatV37SupportSurfaceReadyHook(result: SummaryResult): string {
  return `v37-support-surface=${result.summary}`;
}

export function formatCustomerSuccessReadyHook(result: SummaryResult): string {
  return `customer-success=${result.summary}`;
}

export function formatFeedbackModelReadyHook(result: SummaryResult): string {
  return `feedback-model=${result.summary}`;
}

export function formatEscalationReadyHook(result: SummaryResult): string {
  return `escalation=${result.summary}`;
}

export function formatOperationalGovernanceReadyHook(result: SummaryResult): string {
  return `operational-governance=${result.summary}`;
}
