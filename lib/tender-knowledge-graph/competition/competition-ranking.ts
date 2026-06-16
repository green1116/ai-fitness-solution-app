import type {
  CompetitionRankingEntry,
  CompetitionRankingResult,
  CompetitorBrandNode,
} from "./competition-types";
import { buildCompetitionGraph } from "./competition-graph-context";
import { buildCompetitorBrandNodesForTender } from "./competitor-brand-node";
import { buildAlternativeSolutionNodesForTender } from "./alternative-solution-node";
import { buildSupplierLinkRecords } from "@/lib/brand-intelligence-network";

function toRankings(items: Array<{ id: string; label: string; score: number }>): CompetitionRankingEntry[] {
  const sorted = [...items].sort((a, b) => b.score - a.score);
  const leaderScore = sorted[0]?.score ?? 0;
  return sorted.map((item, index) => ({
    rank: index + 1,
    entityId: item.id,
    label: item.label,
    score: item.score,
    gapToLeader: leaderScore - item.score,
  }));
}

export function buildCompetitionRankings(tenderId: string): CompetitionRankingResult {
  const brandNodes = buildCompetitorBrandNodesForTender(tenderId);
  const alternativeNodes = buildAlternativeSolutionNodesForTender(tenderId);
  const brandIds = new Set(brandNodes.map((node) => node.brandId));

  const competitorBrandRankings = toRankings(
    brandNodes.map((node) => ({
      id: node.brandId,
      label: node.brandName,
      score: node.winPressure,
    })),
  );

  const competitorSupplierRankings = toRankings(
    buildSupplierLinkRecords()
      .filter((link) => brandIds.has(link.brandId))
      .map((link) => ({
        id: link.supplierId,
        label: link.supplierId,
        score: link.linkStatus === "active" ? 80 : 50,
      })),
  );

  const alternativeSolutionRankings = toRankings(
    alternativeNodes.map((node) => ({
      id: node.alternativeId,
      label: node.label,
      score: node.alternativeRisk,
    })),
  );

  return {
    resultId: `tkg-comp-rank-${tenderId}`,
    tenderId,
    competitorBrandRankings,
    competitorSupplierRankings,
    alternativeSolutionRankings,
  };
}

export function findDominantCompetitorFromNodes(
  brandNodes: CompetitorBrandNode[],
): CompetitorBrandNode | undefined {
  const nonPrimary = brandNodes.filter((node) => !node.isPrimary);
  const pool = nonPrimary.length > 0 ? nonPrimary : brandNodes;
  return [...pool].sort((a, b) => b.winPressure - a.winPressure)[0];
}

export function findDominantCompetitorInGraph(tenderId: string): CompetitorBrandNode | undefined {
  const graph = buildCompetitionGraph();
  const brandNodes = graph.nodes.filter(
    (node): node is CompetitorBrandNode =>
      node.nodeType === "competitor-brand" && node.tenderId === tenderId,
  );
  return findDominantCompetitorFromNodes(brandNodes);
}
