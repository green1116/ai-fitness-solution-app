/**
 * V3.7-H2 Production Observability — release gate view
 */

import { buildProductionHardeningFoundation } from "../hardening";

export const RELEASE_GATE_VIEW_VERSION = "3.7-h2-release-gate-1" as const;

export type ReleaseGateView = {
  version: typeof RELEASE_GATE_VIEW_VERSION;
  gateId: string;
  releasable: boolean;
  blocked: boolean;
  warningCount: number;
  confidenceScore: number;
  gateReason: string;
  summary: string;
};

function resolveGateReason(input: {
  blocked: boolean;
  releasable: boolean;
  warnings: string[];
  confidenceScore: number;
}): string {
  if (input.blocked) {
    return input.warnings[0] ?? "Release blocked by hardening baseline.";
  }
  if (!input.releasable) {
    return "Release not authorized — readiness score or warnings exceed threshold.";
  }
  if (input.confidenceScore < 90) {
    return `Release allowed with watch — confidence ${input.confidenceScore}.`;
  }
  return "Release gate open — all hardening signals pass.";
}

export function buildReleaseGateView(input?: { deploymentId?: string }): ReleaseGateView {
  const deploymentId = input?.deploymentId ?? "gate-default";
  const foundation = buildProductionHardeningFoundation({ deploymentId });
  const gateId = `GATE-V37H2-${deploymentId.slice(0, 8)}`;
  const warningCount = foundation.release.warnings.length;
  const confidenceScore = foundation.deployment.confidenceScore;
  const gateReason = resolveGateReason({
    blocked: foundation.release.blocked,
    releasable: foundation.release.releasable,
    warnings: foundation.release.warnings,
    confidenceScore,
  });

  return {
    version: RELEASE_GATE_VIEW_VERSION,
    gateId,
    releasable: foundation.release.releasable,
    blocked: foundation.release.blocked,
    warningCount,
    confidenceScore,
    gateReason,
    summary: `release-gate id=${gateId} releasable=${foundation.release.releasable} blocked=${foundation.release.blocked} warnings=${warningCount} confidence=${confidenceScore}`,
  };
}
