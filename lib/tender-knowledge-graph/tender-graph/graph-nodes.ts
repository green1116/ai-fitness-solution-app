import { buildBrandEvidenceCoverage, buildEvidenceCoverageRecords, buildEvidenceRegistryRecords } from "@/lib/evidence-intelligence-network";
import { buildBrandRegistryRecords } from "@/lib/brand-intelligence-network";
import {
  buildRequirementComplianceRecords,
  buildRequirementRegistryRecords,
} from "@/lib/requirement-intelligence";
import { buildTenderRegistryRecords } from "../tender-registry";
import type {
  BrandNode,
  EvidenceNode,
  RequirementNode,
  TenderGraphNode,
  TenderNode,
} from "../shared/types";

function buildEvidenceCoverageLevelMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const coverage of buildEvidenceCoverageRecords()) {
    for (const evidenceId of coverage.evidenceIds) {
      if (!map.has(evidenceId)) {
        map.set(evidenceId, coverage.coverageLevel);
      }
    }
  }
  return map;
}

function resolveEvidenceCoverageLevel(
  evidenceId: string,
  totalScore: number,
  coverageMap: Map<string, string>,
): string {
  const mapped = coverageMap.get(evidenceId);
  if (mapped) return mapped;
  if (totalScore >= 70) return "full";
  if (totalScore >= 40) return "partial";
  return "minimal";
}

export function buildTenderGraphNodeId(tenderId: string): string {
  return `tkg-node-tender-${tenderId}`;
}

export function buildTkgRequirementNodeId(requirementId: string): string {
  return `tkg-node-requirement-${requirementId}`;
}

export function buildTkgEvidenceNodeId(evidenceId: string): string {
  return `tkg-node-evidence-${evidenceId}`;
}

export function buildTkgBrandNodeId(brandId: string): string {
  return `tkg-node-brand-${brandId}`;
}

export function buildTenderGraphNodes(): TenderNode[] {
  return buildTenderRegistryRecords().map((record) => ({
    nodeId: buildTenderGraphNodeId(record.tenderId),
    nodeType: "tender" as const,
    label: record.title,
    sourceRecordId: record.tenderId,
    sourceLayer: "v41-tender-knowledge-graph",
    tenderId: record.tenderId,
    projectType: record.projectType,
    budget: record.budget,
    region: record.region,
    status: record.status,
    priority: record.priority,
    mode: "tender-knowledge-graph" as const,
  }));
}

export function buildTkgRequirementNodes(): RequirementNode[] {
  const complianceById = new Map(
    buildRequirementComplianceRecords().map((record) => [record.requirementId, record]),
  );

  return buildRequirementRegistryRecords().map((record) => ({
    nodeId: buildTkgRequirementNodeId(record.requirementId),
    nodeType: "requirement" as const,
    label: record.title,
    sourceRecordId: record.requirementId,
    sourceLayer: "v40-requirement-intelligence",
    requirementId: record.requirementId,
    tenderId: record.tenderId,
    kind: record.requirementKind,
    priority: record.priority,
    complianceScore: complianceById.get(record.requirementId)?.complianceScore ?? 0,
    mode: "tender-knowledge-graph" as const,
  }));
}

export function buildTkgEvidenceNodes(linkedEvidenceIds: Set<string>): EvidenceNode[] {
  const coverageMap = buildEvidenceCoverageLevelMap();
  return buildEvidenceRegistryRecords()
    .filter((record) => linkedEvidenceIds.has(record.evidenceId))
    .map((record) => ({
      nodeId: buildTkgEvidenceNodeId(record.evidenceId),
      nodeType: "evidence" as const,
      label: record.title,
      sourceRecordId: record.evidenceId,
      sourceLayer: "v39-evidence-intelligence-network",
      evidenceId: record.evidenceId,
      kind: record.evidenceKind,
      score: record.score.totalEvidenceScore,
      freshness: record.score.freshnessScore,
      coverageLevel: resolveEvidenceCoverageLevel(
        record.evidenceId,
        record.score.totalEvidenceScore,
        coverageMap,
      ),
      mode: "tender-knowledge-graph" as const,
    }));
}

export function buildTkgBrandNodes(linkedBrandIds: Set<string>): BrandNode[] {
  return buildBrandRegistryRecords()
    .filter((record) => linkedBrandIds.has(record.brandId))
    .map((record) => {
      const coverage = buildBrandEvidenceCoverage(record.brandId);
      const strengthScore = record.score.totalBrandScore;
      const winProbability = Math.min(
        100,
        Math.round(strengthScore * 0.5 + coverage.coverageScore * 0.5),
      );

      return {
        nodeId: buildTkgBrandNodeId(record.brandId),
        nodeType: "brand" as const,
        label: record.brandName,
        sourceRecordId: record.brandId,
        sourceLayer: "v38-brand-intelligence-network",
        brandId: record.brandId,
        strengthScore,
        coverage: coverage.coverageScore,
        winProbability,
        mode: "tender-knowledge-graph" as const,
      };
    });
}

export function buildTenderGraphNodeRecords(
  linkedEvidenceIds: Set<string>,
  linkedBrandIds: Set<string>,
): TenderGraphNode[] {
  return [
    ...buildTenderGraphNodes(),
    ...buildTkgRequirementNodes(),
    ...buildTkgEvidenceNodes(linkedEvidenceIds),
    ...buildTkgBrandNodes(linkedBrandIds),
  ];
}
