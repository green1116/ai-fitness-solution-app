/**
 * V4-A1 Operational Sustainability
 */

import {
  computeOperationsScore,
  operationsSummaryPrefix,
} from "./shared";
import { buildProductionOperationsRegistry } from "./registry";
import { buildOperationalStabilityReport } from "./stability";
import { buildOperationalIntelligenceSummary } from "./intelligence";
import { getReleaseFoundationForOperations } from "./operations-context";

export const OPERATIONAL_SUSTAINABILITY_VERSION = "4-a1-operational-sustainability-1" as const;

export type SustainabilityPillar = {
  id: string;
  label: string;
  ready: boolean;
  score: number;
};

export type OperationalSustainabilityReport = {
  version: typeof OPERATIONAL_SUSTAINABILITY_VERSION;
  reportId: string;
  sustainable: boolean;
  sustainabilityScore: number;
  longTermOperational: boolean;
  preservationContinuity: boolean;
  lifecycleContinuity: boolean;
  pillars: SustainabilityPillar[];
  summary: string;
};

export function buildOperationalSustainabilityReport(input?: {
  deploymentId?: string;
}): OperationalSustainabilityReport {
  const deploymentId = input?.deploymentId ?? "operational-sustainability";
  const reportId = `OSU-V4A1-${deploymentId.slice(0, 8)}`;
  const release = getReleaseFoundationForOperations(deploymentId);
  const registry = buildProductionOperationsRegistry({ deploymentId });
  const stability = buildOperationalStabilityReport({ deploymentId });
  const intelligence = buildOperationalIntelligenceSummary({ deploymentId });
  const stack = release.final.readiness;

  const pillars: SustainabilityPillar[] = [
    {
      id: "pillar-freeze",
      label: "Production Freeze Continuity",
      ready: release.lock.locked && release.freeze.integrityState === "sealed",
      score: release.lock.locked ? 100 : stability.stabilityIndex,
    },
    {
      id: "pillar-baseline",
      label: "Release Baseline Continuity",
      ready: release.baseline.baseline.readyForProduction,
      score: release.baseline.baseline.readyForProduction ? 95 : 60,
    },
    {
      id: "pillar-integrity",
      label: "Integrity Continuity",
      ready: release.integrity.baselineVerified && release.integrity.preservationVerified,
      score: stability.integrityStable ? 95 : 55,
    },
    {
      id: "pillar-governance",
      label: "Governance Continuity",
      ready: release.governance.allEnforced,
      score: release.governance.allEnforced ? 90 : 50,
    },
    {
      id: "pillar-operations",
      label: "Operations Registry Coverage",
      ready: registry.operationalCount === registry.records.length,
      score: Math.round((registry.operationalCount / registry.records.length) * 100),
    },
    {
      id: "pillar-intelligence",
      label: "Operational Intelligence",
      ready: intelligence.operationalReadiness,
      score: intelligence.confidenceScore,
    },
  ];

  const sustainabilityScore = Math.round(
    pillars.reduce((sum, p) => sum + p.score, 0) / pillars.length,
  );

  const preservationContinuity = stack.preservationReadiness;
  const lifecycleContinuity = stack.lifecycleReadiness;
  const longTermOperational =
    preservationContinuity &&
    lifecycleContinuity &&
    release.final.productionReady &&
    stability.stabilityIndex >= 80;

  const sustainable =
    longTermOperational &&
    sustainabilityScore >= 80 &&
    computeOperationsScore(pillars.map((p) => p.ready)) >= 80;

  return {
    version: OPERATIONAL_SUSTAINABILITY_VERSION,
    reportId,
    sustainable,
    sustainabilityScore,
    longTermOperational,
    preservationContinuity,
    lifecycleContinuity,
    pillars,
    summary: `${operationsSummaryPrefix(deploymentId)} sustainability=${sustainable} score=${sustainabilityScore} longTerm=${longTermOperational}`,
  };
}
