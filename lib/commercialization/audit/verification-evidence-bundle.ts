/**
 * V3.7-H4 Production Audit — verification evidence bundle
 */

import { BUILD_FREEZE_MANIFEST, formatBuildFreezeSummary } from "../stabilization/build-freeze";
import { buildProductionHardeningFoundation } from "../hardening";
import { buildProductionObservabilityFoundation } from "../observability";
import { buildProductionDashboardFoundation } from "../dashboard";

export const VERIFICATION_EVIDENCE_BUNDLE_VERSION = "3.7-h4-evidence-1" as const;

export type VerificationEvidenceBundle = {
  version: typeof VERIFICATION_EVIDENCE_BUNDLE_VERSION;
  bundleId: string;
  buildEvidence: string;
  tscEvidence: string;
  verifyEvidence: string;
  hardeningEvidence: string;
  observabilityEvidence: string;
  dashboardEvidence: string;
  summary: string;
};

export function buildVerificationEvidenceBundle(input?: {
  deploymentId?: string;
}): VerificationEvidenceBundle {
  const deploymentId = input?.deploymentId ?? "evidence-default";
  const bundleId = `EVD-V37H4-${deploymentId.slice(0, 8)}`;
  const hardening = buildProductionHardeningFoundation({ deploymentId });
  const observability = buildProductionObservabilityFoundation({ deploymentId });
  const dashboard = buildProductionDashboardFoundation({ deploymentId });
  const freeze = BUILD_FREEZE_MANIFEST;

  const buildEvidence = formatBuildFreezeSummary();
  const tscEvidence = `tscPassed=${freeze.tscPassed} buildPassed=${freeze.buildPassed}`;
  const verifyEvidence = `runtimeVerified=${freeze.runtimeVerified} evidenceVerified=${freeze.evidenceVerified} executiveVerified=${freeze.executiveVerified} pipelines=verify:all,verify:stability,verify:hardening,verify:observability,verify:dashboard,verify:audit`;
  const hardeningEvidence = hardening.summary;
  const observabilityEvidence = observability.summary;
  const dashboardEvidence = dashboard.summary;

  return {
    version: VERIFICATION_EVIDENCE_BUNDLE_VERSION,
    bundleId,
    buildEvidence,
    tscEvidence,
    verifyEvidence,
    hardeningEvidence,
    observabilityEvidence,
    dashboardEvidence,
    summary: `verification-evidence id=${bundleId} releaseReady=${dashboard.opsPanel.releaseReady}`,
  };
}
