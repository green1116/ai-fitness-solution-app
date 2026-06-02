/**
 * V4-A1 Operational Readiness Summary
 */

import {
  computeOperationsScore,
  operationsSummaryPrefix,
} from "./shared";
import { buildProductionOperationsRegistry } from "./registry";
import { buildOperationalStabilityReport } from "./stability";
import { getReleaseFoundationForOperations } from "./operations-context";

export const OPERATIONAL_INTELLIGENCE_VERSION = "4-a1-operational-intelligence-1" as const;

export type OperationalInsight = {
  id: string;
  category: "release" | "freeze" | "integrity" | "governance" | "sustainability";
  severity: "info" | "watch" | "critical";
  message: string;
};

export type OperationalIntelligenceSummary = {
  version: typeof OPERATIONAL_INTELLIGENCE_VERSION;
  summaryId: string;
  confidenceScore: number;
  releaseReadiness: boolean;
  operationalReadiness: boolean;
  insights: OperationalInsight[];
  insightCount: number;
  summary: string;
};

export function buildOperationalIntelligenceSummary(input?: {
  deploymentId?: string;
}): OperationalIntelligenceSummary {
  const deploymentId = input?.deploymentId ?? "operational-intelligence";
  const summaryId = `OIS-V4A1-${deploymentId.slice(0, 8)}`;
  const release = getReleaseFoundationForOperations(deploymentId);
  const registry = buildProductionOperationsRegistry({ deploymentId });
  const stability = buildOperationalStabilityReport({ deploymentId });

  const insights: OperationalInsight[] = [];

  if (release.final.productionReady) {
    insights.push({
      id: "ins-production-ready",
      category: "release",
      severity: "info",
      message: `Production release baseline ready (confidence=${release.final.readiness.confidenceScore}).`,
    });
  }

  if (release.lock.locked) {
    insights.push({
      id: "ins-freeze-locked",
      category: "freeze",
      severity: "info",
      message: `Production freeze sealed and locked (${release.freeze.freezeId}).`,
    });
  }

  if (release.integrity.preservationVerified) {
    insights.push({
      id: "ins-preservation",
      category: "integrity",
      severity: "info",
      message: "Preservation continuity verified under integrity layer.",
    });
  }

  if (release.governance.allEnforced) {
    insights.push({
      id: "ins-governance",
      category: "governance",
      severity: "info",
      message: "Release governance policies fully enforced.",
    });
  }

  if (stability.degradedOpsCount > 0) {
    insights.push({
      id: "ins-degraded-ops",
      category: "sustainability",
      severity: "watch",
      message: `${stability.degradedOpsCount} operation(s) in degraded state.`,
    });
  }

  if (stability.stabilityIndex < 80) {
    insights.push({
      id: "ins-stability-watch",
      category: "sustainability",
      severity: "watch",
      message: `Operational stability index below target (${stability.stabilityIndex}).`,
    });
  }

  const avgConfidence = Math.round(
    registry.records.reduce((sum, r) => sum + r.operationalConfidence, 0) / registry.records.length,
  );

  const releaseReadiness = release.final.productionReady;
  const operationalReadiness =
    releaseReadiness &&
    stability.stabilityIndex >= 80 &&
    registry.operationalCount === registry.records.length;

  const confidenceFlags = [
    releaseReadiness,
    release.lock.locked,
    release.governance.allEnforced,
    stability.baselineAligned,
    operationalReadiness,
  ];
  const confidenceScore = Math.round((avgConfidence + computeOperationsScore(confidenceFlags)) / 2);

  return {
    version: OPERATIONAL_INTELLIGENCE_VERSION,
    summaryId,
    confidenceScore,
    releaseReadiness,
    operationalReadiness,
    insights,
    insightCount: insights.length,
    summary: `${operationsSummaryPrefix(deploymentId)} intelligence confidence=${confidenceScore} insights=${insights.length} operationalReady=${operationalReadiness}`,
  };
}
