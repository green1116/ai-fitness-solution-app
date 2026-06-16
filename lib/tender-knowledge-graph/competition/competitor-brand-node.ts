import { buildBrandRegistryRecords } from "@/lib/brand-intelligence-network";
import { buildBrandEvidenceCoverage } from "@/lib/evidence-intelligence-network";
import {
  buildRequirementComplianceRecords,
  findRequirementByTender,
} from "@/lib/requirement-intelligence";
import { buildTenderBrandEdges } from "../tender-graph/tender-brand-edge";
import { buildTenderRegistryRecords } from "../tender-registry";
import type { CompetitorBrandNode } from "./competition-types";
import { buildCompetitorBrandNodeId } from "./competition-node";

function resolveBrandMetrics(tenderId: string, brandId: string) {
  const requirements = findRequirementByTender(tenderId).filter((req) => req.brandId === brandId);
  const complianceRecords = buildRequirementComplianceRecords().filter((record) =>
    requirements.some((req) => req.requirementId === record.requirementId),
  );

  const requirementCoverage =
    requirements.length === 0
      ? 0
      : Math.round(
          (complianceRecords.filter(
            (record) =>
              record.complianceStatus === "pass" || record.complianceStatus === "partial",
          ).length /
            requirements.length) *
            100,
        );

  const evidenceReadiness =
    complianceRecords.length === 0
      ? 0
      : Math.round(
          complianceRecords.reduce((sum, record) => sum + record.factors.evidenceReadiness, 0) /
            complianceRecords.length,
        );

  const complianceScore =
    complianceRecords.length === 0
      ? 0
      : Math.round(
          complianceRecords.reduce((sum, record) => sum + record.complianceScore, 0) /
            complianceRecords.length,
        );

  return { requirementCoverage, evidenceReadiness, complianceScore };
}

function resolvePrimaryBrandId(tenderId: string): string | undefined {
  const edges = buildTenderBrandEdges().filter((edge) => edge.sourceId === tenderId);
  if (edges.length === 0) return undefined;
  return [...edges].sort((a, b) => b.weight - a.weight)[0]?.targetId;
}

export function buildCompetitorBrandNodesForTender(tenderId: string): CompetitorBrandNode[] {
  const brandById = new Map(buildBrandRegistryRecords().map((brand) => [brand.brandId, brand]));
  const primaryBrandId = resolvePrimaryBrandId(tenderId);
  const competitorBrandIds = new Set(
    buildTenderBrandEdges()
      .filter((edge) => edge.sourceId === tenderId)
      .map((edge) => edge.targetId),
  );

  if (competitorBrandIds.size < 2) {
    for (const brand of buildBrandRegistryRecords()) {
      competitorBrandIds.add(brand.brandId);
      if (competitorBrandIds.size >= 3) break;
    }
  }

  const nodes: CompetitorBrandNode[] = [];

  for (const brandId of competitorBrandIds) {
    const brand = brandById.get(brandId);
    if (!brand) continue;

    const metrics = resolveBrandMetrics(tenderId, brandId);
    const coverage = buildBrandEvidenceCoverage(brandId);
    const strengthScore = brand.score.totalBrandScore;
    const brandAdvantage = Math.round(strengthScore * 0.5 + coverage.coverageScore * 0.5);
    const winPressure = Math.min(
      100,
      Math.round(brandAdvantage * 0.6 + metrics.complianceScore * 0.4),
    );

    nodes.push({
      nodeId: buildCompetitorBrandNodeId(tenderId, brandId),
      nodeType: "competitor-brand",
      label: brand.brandName,
      sourceRecordId: brandId,
      sourceLayer: "v38-brand-intelligence-network",
      tenderId,
      brandId,
      brandName: brand.brandName,
      strengthScore,
      winPressure,
      brandAdvantage,
      requirementCoverage: metrics.requirementCoverage,
      complianceScore: metrics.complianceScore,
      evidenceReadiness: metrics.evidenceReadiness,
      isPrimary: brandId === primaryBrandId,
      mode: "tender-knowledge-graph",
    });
  }

  return nodes;
}

export function buildAllCompetitorBrandNodes(): CompetitorBrandNode[] {
  const nodes: CompetitorBrandNode[] = [];
  const seen = new Set<string>();

  for (const tender of buildTenderRegistryRecords()) {
    for (const node of buildCompetitorBrandNodesForTender(tender.tenderId)) {
      if (seen.has(node.nodeId)) continue;
      seen.add(node.nodeId);
      nodes.push(node);
    }
  }

  return nodes;
}
