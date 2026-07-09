/**
 * V100 — Pilot final sign-off (collect V80–V99 readiness, read-only aggregation)
 */

import { buildReadinessSummary } from "@/lib/pilot/v99";

import { getCapabilityCatalog } from "./capability-catalog";
import { getSignoffState } from "./signoff-cache";
import type {
  LayerReadinessEntry,
  PilotReleaseStatus,
  PilotSignoffReport,
} from "./signoff.types";

export function collectLayerReadiness(): LayerReadinessEntry[] {
  return getCapabilityCatalog().map((entry) => ({
    version: entry.version,
    capability: entry.capability,
    included: true,
    verifyScript: entry.verifyScript,
    readOnly: true,
  }));
}

function scoreFromReadiness(dimensions: { score: number }[]): number {
  if (dimensions.length === 0) return 0;
  return Math.round(
    dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length,
  );
}

export function deriveReleaseStatus(
  organizationId: string,
  overallReadiness: string,
): PilotReleaseStatus {
  const state = getSignoffState(organizationId);
  if (state.releaseStatus === "released") return "released";
  if (state.releaseStatus === "frozen") return "frozen";
  if (state.releaseStatus === "signed_off") return "signed_off";

  if (overallReadiness === "not_ready") return "draft";
  return "ready_for_signoff";
}

export function buildPilotSignoffReport(organizationId: string): PilotSignoffReport {
  const readinessSummary = buildReadinessSummary(organizationId);
  const collectedLayers = collectLayerReadiness();
  const overallPilotScore = scoreFromReadiness(readinessSummary.dimensions);
  const state = getSignoffState(organizationId);
  const overallReleaseStatus = deriveReleaseStatus(
    organizationId,
    readinessSummary.overallReadiness,
  );

  return {
    collectedLayers,
    layerCount: collectedLayers.length,
    readinessSummary,
    overallPilotScore,
    overallReleaseStatus,
    certificationStatus: readinessSummary.certificationStatus,
    signedOffAt: state.signedOffAt,
    signedOffBy: state.signedOffBy,
    readOnly: true,
  };
}
