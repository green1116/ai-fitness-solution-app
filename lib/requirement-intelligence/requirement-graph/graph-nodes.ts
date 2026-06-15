import { buildBrandRegistryRecords } from "@/lib/brand-intelligence-network";
import { buildEvidenceRegistryRecords } from "@/lib/evidence-intelligence-network";
import { buildRequirementRegistryRecords } from "../requirement-registry";
import type { RequirementIntelligenceMode, RequirementKind, RequirementStatus } from "../shared/types";

export type RequirementGraphNodeType = "tender" | "requirement" | "evidence" | "brand";

export interface GraphNodeBase {
  nodeId: string;
  nodeType: RequirementGraphNodeType;
  label: string;
  sourceRecordId: string;
  sourceLayer: string;
  mode: RequirementIntelligenceMode;
}

export interface TenderNode extends GraphNodeBase {
  nodeType: "tender";
  tenderId: string;
}

export interface RequirementNode extends GraphNodeBase {
  nodeType: "requirement";
  requirementId: string;
  requirementKind: RequirementKind;
  requirementStatus: RequirementStatus;
  tenderId: string;
}

export interface EvidenceNode extends GraphNodeBase {
  nodeType: "evidence";
  evidenceId: string;
  evidenceKind: string;
  brandId: string;
}

export interface BrandNode extends GraphNodeBase {
  nodeType: "brand";
  brandId: string;
  brandName: string;
}

export type RequirementGraphNode = TenderNode | RequirementNode | EvidenceNode | BrandNode;

export function buildTenderGraphNodeId(tenderId: string): string {
  return `req-graph-node-tender-${tenderId}`;
}

export function buildRequirementGraphNodeId(requirementId: string): string {
  return `req-graph-node-requirement-${requirementId}`;
}

export function buildEvidenceGraphNodeId(evidenceId: string): string {
  return `req-graph-node-evidence-${evidenceId}`;
}

export function buildBrandGraphNodeId(brandId: string): string {
  return `req-graph-node-brand-${brandId}`;
}

export function buildTenderGraphNodes(): TenderNode[] {
  const tenderIds = [...new Set(buildRequirementRegistryRecords().map((record) => record.tenderId))];

  return tenderIds.map((tenderId) => ({
    nodeId: buildTenderGraphNodeId(tenderId),
    nodeType: "tender" as const,
    label: tenderId,
    sourceRecordId: tenderId,
    sourceLayer: "v40-requirement-intelligence",
    tenderId,
    mode: "requirement-intelligence" as const,
  }));
}

export function buildRequirementGraphNodes(): RequirementNode[] {
  return buildRequirementRegistryRecords().map((record) => ({
    nodeId: buildRequirementGraphNodeId(record.requirementId),
    nodeType: "requirement" as const,
    label: record.title,
    sourceRecordId: record.requirementId,
    sourceLayer: "v40-requirement-intelligence",
    requirementId: record.requirementId,
    requirementKind: record.requirementKind,
    requirementStatus: record.requirementStatus,
    tenderId: record.tenderId,
    mode: "requirement-intelligence" as const,
  }));
}

export function buildEvidenceGraphNodes(linkedEvidenceIds: Set<string>): EvidenceNode[] {
  const records = buildEvidenceRegistryRecords().filter((record) =>
    linkedEvidenceIds.has(record.evidenceId),
  );

  return records.map((record) => ({
    nodeId: buildEvidenceGraphNodeId(record.evidenceId),
    nodeType: "evidence" as const,
    label: record.title,
    sourceRecordId: record.evidenceId,
    sourceLayer: "v39-evidence-intelligence-network",
    evidenceId: record.evidenceId,
    evidenceKind: record.evidenceKind,
    brandId: record.brandId,
    mode: "requirement-intelligence" as const,
  }));
}

export function buildBrandGraphNodes(brandIds: Iterable<string>): BrandNode[] {
  const brandMap = new Map(buildBrandRegistryRecords().map((brand) => [brand.brandId, brand]));

  return [...brandIds].map((brandId) => {
    const brand = brandMap.get(brandId);
    return {
      nodeId: buildBrandGraphNodeId(brandId),
      nodeType: "brand" as const,
      label: brand?.brandName ?? brandId,
      sourceRecordId: brandId,
      sourceLayer: "v38-brand-intelligence-network",
      brandId,
      brandName: brand?.brandName ?? brandId,
      mode: "requirement-intelligence" as const,
    };
  });
}

export function buildRequirementGraphNodeRecords(
  linkedEvidenceIds: Set<string>,
  brandIds: Iterable<string>,
): RequirementGraphNode[] {
  return [
    ...buildTenderGraphNodes(),
    ...buildRequirementGraphNodes(),
    ...buildEvidenceGraphNodes(linkedEvidenceIds),
    ...buildBrandGraphNodes(brandIds),
  ];
}
