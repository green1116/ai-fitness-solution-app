import {
  buildRequirementComplianceRecords,
  findRequirementByTender,
} from "@/lib/requirement-intelligence";
import { buildSupplierLinkRecords } from "@/lib/brand-intelligence-network";
import { CANONICAL_TENDER_GRAPH_TENDER_ID } from "../shared/constants";
import { calculateWinProbability } from "../tender-scoring";
import type {
  CompetitionAnalysisResult,
  CompetitionMetrics,
  CompetitorBrandNode,
} from "./competition-types";
import { buildCompetitionGraph } from "./competition-graph-context";
import {
  buildCompetitionRankings,
  findDominantCompetitorFromNodes,
  findDominantCompetitorInGraph,
} from "./competition-ranking";
import { buildAlternativeSolutionNodesForTender } from "./alternative-solution-node";
import { buildCompetitorBrandNodesForTender } from "./competitor-brand-node";

const cachedAnalysis = new Map<string, CompetitionAnalysisResult>();

function estimateCompetitorWinProbability(node: CompetitorBrandNode): number {
  return Math.min(
    100,
    Math.round(
      node.requirementCoverage * 0.25 +
        node.evidenceReadiness * 0.25 +
        node.brandAdvantage * 0.25 +
        node.complianceScore * 0.2 +
        node.strengthScore * 0.05,
    ),
  );
}

function buildCounterStrategyHints(
  metrics: CompetitionMetrics,
  dominant: CompetitorBrandNode | undefined,
): string[] {
  const hints: string[] = [];
  if (metrics.requirementCoverageGap < 0) hints.push("improve-requirement-coverage-vs-dominant");
  if (metrics.evidenceStrengthGap < 0) hints.push("strengthen-evidence-readiness");
  if (metrics.complianceGap < 0) hints.push("close-compliance-gap");
  if (metrics.supplierPressure >= 70) hints.push("expand-supplier-authorization-coverage");
  if (metrics.alternativeSolutionStrength >= 65) hints.push("differentiate-against-alternative-solutions");
  if (dominant) hints.push(`focus-counter-strategy-on:${dominant.brandId}`);
  return hints.length > 0 ? hints : ["maintain-current-competitive-position"];
}

export function calculateWinPressure(tenderId: string): number {
  const brandNodes = buildCompetitorBrandNodesForTender(tenderId);
  const primary = brandNodes.find((node) => node.isPrimary);
  const competitors = brandNodes.filter((node) => !node.isPrimary);
  if (!primary || competitors.length === 0) {
    return Math.round(
      competitors.reduce((sum, node) => sum + node.winPressure, 0) /
        Math.max(competitors.length, 1),
    );
  }
  const avgCompetitorPressure =
    competitors.reduce((sum, node) => sum + node.winPressure, 0) / competitors.length;
  return Math.min(100, Math.round(avgCompetitorPressure - primary.winPressure * 0.3 + 50));
}

export function findDominantCompetitor(tenderId: string): CompetitorBrandNode | undefined {
  return (
    findDominantCompetitorInGraph(tenderId) ??
    findDominantCompetitorFromNodes(buildCompetitorBrandNodesForTender(tenderId))
  );
}

export function compareBrandsInTender(tenderId: string, brandIds?: string[]): CompetitionMetrics {
  const brandNodes = buildCompetitorBrandNodesForTender(tenderId).filter((node) =>
    brandIds ? brandIds.includes(node.brandId) : true,
  );
  const primary = brandNodes.find((node) => node.isPrimary) ?? brandNodes[0];
  const dominant = findDominantCompetitorFromNodes(brandNodes);
  const win = calculateWinProbability(tenderId);

  const bestCompetitor = [...brandNodes]
    .filter((node) => node.brandId !== primary?.brandId)
    .sort((a, b) => b.winPressure - a.winPressure)[0];

  const supplierLinks = buildSupplierLinkRecords().filter((link) =>
    brandNodes.some((node) => node.brandId === link.brandId),
  );
  const alternativeNodes = buildAlternativeSolutionNodesForTender(tenderId);
  const dominantWin = dominant ? estimateCompetitorWinProbability(dominant) : 0;

  return {
    competitionDensity: Math.min(100, brandNodes.length * 15),
    brandWinPressure: calculateWinPressure(tenderId),
    supplierPressure: Math.min(
      100,
      Math.round(
        supplierLinks.filter((l) => l.linkStatus === "active").length * 18 +
          (bestCompetitor?.brandAdvantage ?? 0) * 0.2,
      ),
    ),
    alternativeSolutionStrength: Math.min(
      100,
      Math.round(
        alternativeNodes.reduce((sum, node) => sum + node.alternativeRisk, 0) /
          Math.max(alternativeNodes.length, 1),
      ),
    ),
    requirementCoverageGap:
      (primary?.requirementCoverage ?? 0) - (bestCompetitor?.requirementCoverage ?? 0),
    evidenceStrengthGap:
      (primary?.evidenceReadiness ?? 0) - (bestCompetitor?.evidenceReadiness ?? 0),
    complianceGap: (primary?.complianceScore ?? 0) - (bestCompetitor?.complianceScore ?? 0),
    winProbabilityDelta: win.winProbability - dominantWin,
    riskPressureScore: Math.min(
      100,
      Math.round(100 - win.winProbability + calculateWinPressure(tenderId) * 0.4),
    ),
  };
}

export function simulateWinScenario(tenderId: string): CompetitionAnalysisResult {
  const base = analyzeTenderCompetition(tenderId);
  const simulatedMetrics: CompetitionMetrics = {
    ...base.metrics,
    competitionDensity: Math.max(0, base.metrics.competitionDensity - 20),
    brandWinPressure: Math.max(0, base.metrics.brandWinPressure - 15),
    requirementCoverageGap: base.metrics.requirementCoverageGap + 10,
    evidenceStrengthGap: base.metrics.evidenceStrengthGap + 8,
    complianceGap: base.metrics.complianceGap + 8,
    winProbabilityDelta: base.winProbabilityDelta + 12,
    riskPressureScore: Math.max(0, base.metrics.riskPressureScore - 18),
  };

  return {
    ...base,
    analysisId: `tkg-comp-sim-${tenderId}`,
    metrics: simulatedMetrics,
    winProbabilityDelta: simulatedMetrics.winProbabilityDelta,
    riskSummary: `simulated winPressure=${simulatedMetrics.brandWinPressure} delta=${simulatedMetrics.winProbabilityDelta}`,
    gapSummary: `simulated coverageGap=${simulatedMetrics.requirementCoverageGap}`,
    bestCounterStrategyHints: [...base.bestCounterStrategyHints, "simulate-reduced-competition-density"],
  };
}

export function analyzeTenderCompetition(tenderId: string): CompetitionAnalysisResult {
  const cached = cachedAnalysis.get(tenderId);
  if (cached) return cached;

  const graph = buildCompetitionGraph();
  const metrics = compareBrandsInTender(tenderId);
  const rankings = buildCompetitionRankings(tenderId);
  const dominant = findDominantCompetitor(tenderId);
  const requirements = findRequirementByTender(tenderId);
  const complianceRecords = buildRequirementComplianceRecords().filter((record) =>
    requirements.some((req) => req.requirementId === record.requirementId),
  );

  const blockers = complianceRecords.flatMap((record) => record.gap.criticalBlockers);
  const riskSummary =
    blockers.length > 0
      ? `competition-risk blockers=${blockers.length} pressure=${metrics.brandWinPressure}`
      : `competition-pressure=${metrics.brandWinPressure} density=${metrics.competitionDensity}`;

  const result: CompetitionAnalysisResult = {
    analysisId: `tkg-comp-analysis-${tenderId}`,
    tenderId,
    competitionGraph: graph,
    metrics,
    competitorBrandRankings: rankings.competitorBrandRankings,
    competitorSupplierRankings: rankings.competitorSupplierRankings,
    alternativeSolutionRankings: rankings.alternativeSolutionRankings,
    winProbabilityDelta: metrics.winProbabilityDelta,
    riskSummary,
    gapSummary: `reqGap=${metrics.requirementCoverageGap}|evidenceGap=${metrics.evidenceStrengthGap}|complianceGap=${metrics.complianceGap}`,
    dominantCompetitor: dominant,
    bestCounterStrategyHints: buildCounterStrategyHints(metrics, dominant),
    mode: "tender-knowledge-graph",
  };

  cachedAnalysis.set(tenderId, result);
  return result;
}

export function analyzeCanonicalTenderCompetition(): CompetitionAnalysisResult {
  return analyzeTenderCompetition(CANONICAL_TENDER_GRAPH_TENDER_ID);
}
