/**
 * V3.7-H3 Production Dashboard — release control summary
 */

import { buildProductionObservabilityFoundation } from "../observability";
import { buildProductionHardeningFoundation } from "../hardening";

export const RELEASE_CONTROL_SUMMARY_VERSION = "3.7-h3-release-control-1" as const;

export type ReleaseControlSummary = {
  version: typeof RELEASE_CONTROL_SUMMARY_VERSION;
  summaryId: string;
  releaseReady: boolean;
  blocked: boolean;
  warningCount: number;
  confidenceScore: number;
  gateReason: string;
  opsNotes: string[];
  summary: string;
};

function buildOpsNotes(input: {
  releaseReady: boolean;
  blocked: boolean;
  warnings: string[];
  opsReady: boolean;
  commercialReady: boolean;
}): string[] {
  const notes: string[] = [];
  if (input.releaseReady) {
    notes.push("Release control: baseline signals allow production publish.");
  } else if (input.blocked) {
    notes.push("Release control: publish blocked — review hardening baseline.");
  } else {
    notes.push("Release control: publish held — readiness not fully green.");
  }
  if (input.warnings.length > 0) {
    notes.push(...input.warnings.slice(0, 3));
  }
  if (input.opsReady) {
    notes.push("Ops panel: operational readiness confirmed.");
  }
  if (input.commercialReady) {
    notes.push("Commercial surface: release confidence acceptable.");
  }
  return notes;
}

export function buildReleaseControlSummary(input?: {
  deploymentId?: string;
}): ReleaseControlSummary {
  const deploymentId = input?.deploymentId ?? "release-ctrl";
  const observability = buildProductionObservabilityFoundation({ deploymentId });
  const hardening = buildProductionHardeningFoundation({ deploymentId });
  const summaryId = `RC-V37H3-${deploymentId.slice(0, 8)}`;
  const gate = observability.releaseGate;
  const opsNotes = buildOpsNotes({
    releaseReady: observability.status.releaseReady,
    blocked: gate.blocked,
    warnings: hardening.release.warnings,
    opsReady: hardening.operational.opsReady,
    commercialReady: hardening.operational.commercialReady,
  });

  return {
    version: RELEASE_CONTROL_SUMMARY_VERSION,
    summaryId,
    releaseReady: observability.status.releaseReady,
    blocked: gate.blocked,
    warningCount: gate.warningCount,
    confidenceScore: gate.confidenceScore,
    gateReason: gate.gateReason,
    opsNotes,
    summary: `release-control id=${summaryId} releaseReady=${observability.status.releaseReady} blocked=${gate.blocked} warnings=${gate.warningCount} confidence=${gate.confidenceScore}`,
  };
}
