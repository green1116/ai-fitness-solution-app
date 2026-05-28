/**
 * V4-A2 Production Health Intelligence
 */

import { isBuildFreezeIntact } from "../../release/shared";
import { buildOperationalStabilityReport } from "../stability";
import { getReleaseFoundationForOperations } from "../operations-context";
import { averageNormalizedScore, createOperationalSignalBatch } from "./signals";
import type { OperationalHealthSnapshot } from "./types";
import { V4A2_INTELLIGENCE_VERSION } from "./types";

function healthStatus(score: number): OperationalHealthSnapshot["status"] {
  if (score >= 90) return "healthy";
  if (score >= 80) return "watch";
  if (score >= 60) return "degraded";
  return "critical";
}

export function buildOperationalHealthSnapshot(input?: {
  deploymentId?: string;
}): OperationalHealthSnapshot {
  const deploymentId = input?.deploymentId ?? "operational-health";
  const snapshotId = `OHS-V4A2-${deploymentId.slice(0, 8)}`;
  const signals = createOperationalSignalBatch({ deploymentId });
  const release = getReleaseFoundationForOperations(deploymentId);
  const stability = buildOperationalStabilityReport({ deploymentId });

  const signalScore = averageNormalizedScore(signals.signals);
  const stabilityScore = stability.stabilityIndex;
  const releaseScore = release.final.productionReady
    ? release.final.readiness.confidenceScore
    : 55;
  const governanceScore = release.governance.allEnforced ? 92 : 58;
  const operationalScore = Math.round((signalScore + stabilityScore) / 2);
  const healthScore = Math.round(
    (stabilityScore + releaseScore + governanceScore + operationalScore) / 4,
  );

  return {
    version: V4A2_INTELLIGENCE_VERSION,
    snapshotId,
    healthScore,
    stabilityScore,
    releaseScore,
    governanceScore,
    operationalScore,
    status: healthStatus(healthScore),
    source: "health.derive",
    traceId: `trace-health-${deploymentId.slice(0, 8)}`,
    observedAt: signals.collectedAt,
    summary: `operational-health id=${snapshotId} score=${healthScore} status=${healthStatus(healthScore)} freeze=${isBuildFreezeIntact()}`,
  };
}
