import { buildBrandComparisons } from "@/lib/brand-catalog-intelligence/brand-comparison/builders";
import { findBrandByNameOrAlias } from "@/lib/brand-intelligence-network";
import { buildTenderRegistryRecords } from "../tender-registry";
import type { AlternativeSolutionNode } from "./competition-types";
import { buildAlternativeSolutionNodeId } from "./competition-node";
import { buildCompetitorBrandNodesForTender } from "./competitor-brand-node";

function buildComparisonAlternatives(tenderId: string): AlternativeSolutionNode[] {
  const nodes: AlternativeSolutionNode[] = [];
  const seen = new Set<string>();

  for (const comparison of buildBrandComparisons()) {
    const brandA = findBrandByNameOrAlias(comparison.brandA);
    const brandB = findBrandByNameOrAlias(comparison.brandB);
    if (!brandA || !brandB) continue;

    const alternativeId = `alt-${tenderId}-${brandA.brandId}-vs-${brandB.brandId}`;
    if (seen.has(alternativeId)) continue;
    seen.add(alternativeId);

    nodes.push({
      nodeId: buildAlternativeSolutionNodeId(alternativeId),
      nodeType: "alternative-solution",
      label: `${comparison.brandA} vs ${comparison.brandB}`,
      sourceRecordId: comparison.comparisonId,
      sourceLayer: "brand-catalog-intelligence",
      alternativeId,
      tenderId,
      sourceBrandId: brandA.brandId,
      targetBrandId: brandB.brandId,
      solutionKind: "brand-comparison",
      alternativeRisk: Math.min(100, 100 - comparison.comparisonScore + 20),
      strengthScore: comparison.comparisonScore,
      mode: "tender-knowledge-graph",
    });
  }

  return nodes;
}

function buildCrossBrandAlternatives(tenderId: string): AlternativeSolutionNode[] {
  const brands = buildCompetitorBrandNodesForTender(tenderId);
  const nodes: AlternativeSolutionNode[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < brands.length; i += 1) {
    for (let j = i + 1; j < brands.length; j += 1) {
      const source = brands[i]!;
      const target = brands[j]!;
      const alternativeId = `alt-cross-${tenderId}-${source.brandId}-${target.brandId}`;
      if (seen.has(alternativeId)) continue;
      seen.add(alternativeId);

      const strengthScore = Math.round((source.brandAdvantage + target.brandAdvantage) / 2);
      nodes.push({
        nodeId: buildAlternativeSolutionNodeId(alternativeId),
        nodeType: "alternative-solution",
        label: `${source.brandName} ↔ ${target.brandName}`,
        sourceRecordId: alternativeId,
        sourceLayer: "v41-competition-graph",
        alternativeId,
        tenderId,
        sourceBrandId: source.brandId,
        targetBrandId: target.brandId,
        solutionKind: "cross-brand",
        alternativeRisk: Math.min(100, Math.abs(source.winPressure - target.winPressure) + 25),
        strengthScore,
        mode: "tender-knowledge-graph",
      });
    }
  }

  return nodes;
}

export function buildAlternativeSolutionNodesForTender(tenderId: string): AlternativeSolutionNode[] {
  const merged = [...buildComparisonAlternatives(tenderId), ...buildCrossBrandAlternatives(tenderId)];
  const seen = new Set<string>();
  const nodes: AlternativeSolutionNode[] = [];

  for (const node of merged) {
    if (seen.has(node.alternativeId)) continue;
    seen.add(node.alternativeId);
    nodes.push(node);
  }

  return nodes;
}

export function buildAllAlternativeSolutionNodes(): AlternativeSolutionNode[] {
  const nodes: AlternativeSolutionNode[] = [];
  const seen = new Set<string>();

  for (const tender of buildTenderRegistryRecords()) {
    for (const node of buildAlternativeSolutionNodesForTender(tender.tenderId)) {
      if (seen.has(node.alternativeId)) continue;
      seen.add(node.alternativeId);
      nodes.push(node);
    }
  }

  return nodes;
}
