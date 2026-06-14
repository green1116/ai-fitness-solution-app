import {
  buildBrandRegistryRecords,
  buildManufacturerRegistryRecords,
  buildSkuLinkRecords,
} from "@/lib/brand-intelligence-network";
import { buildEvidenceRegistryRecords } from "../evidence-registry";
import type { EvidenceIntelligenceMode, EvidenceKind, EvidenceStatus } from "../shared/types";

export type GraphNodeType = "brand" | "evidence" | "sku" | "manufacturer";

export interface GraphNodeBase {
  nodeId: string;
  nodeType: GraphNodeType;
  label: string;
  sourceRecordId: string;
  sourceLayer: string;
  mode: EvidenceIntelligenceMode;
}

export interface BrandNode extends GraphNodeBase {
  nodeType: "brand";
  brandId: string;
  brandName: string;
  brandStatus: string;
}

export interface EvidenceNode extends GraphNodeBase {
  nodeType: "evidence";
  evidenceId: string;
  evidenceKind: EvidenceKind;
  evidenceStatus: EvidenceStatus;
  brandId: string;
}

export interface SKUNode extends GraphNodeBase {
  nodeType: "sku";
  sku: string;
  brandId: string;
  productId?: string;
}

export interface ManufacturerNode extends GraphNodeBase {
  nodeType: "manufacturer";
  manufacturerId: string;
  manufacturerName: string;
  region: string;
}

export type EvidenceGraphNode = BrandNode | EvidenceNode | SKUNode | ManufacturerNode;

export function buildBrandGraphNodeId(brandId: string): string {
  return `graph-node-brand-${brandId}`;
}

export function buildEvidenceGraphNodeId(evidenceId: string): string {
  return `graph-node-evidence-${evidenceId}`;
}

export function buildSkuGraphNodeId(brandId: string, sku: string): string {
  return `graph-node-sku-${brandId}-${sku.toLowerCase()}`;
}

export function buildManufacturerGraphNodeId(manufacturerId: string): string {
  return `graph-node-manufacturer-${manufacturerId}`;
}

export function buildRequirementStubNodeId(evidenceId: string): string {
  return `graph-node-req-stub-${evidenceId}`;
}

export function buildBrandGraphNodes(): BrandNode[] {
  return buildBrandRegistryRecords().map((brand) => ({
    nodeId: buildBrandGraphNodeId(brand.brandId),
    nodeType: "brand" as const,
    label: brand.brandName,
    sourceRecordId: brand.brandId,
    sourceLayer: "v38-brand-intelligence-network",
    brandId: brand.brandId,
    brandName: brand.brandName,
    brandStatus: brand.brandStatus,
    mode: "evidence-intelligence-network" as const,
  }));
}

export function buildEvidenceGraphNodes(): EvidenceNode[] {
  return buildEvidenceRegistryRecords().map((record) => ({
    nodeId: buildEvidenceGraphNodeId(record.evidenceId),
    nodeType: "evidence" as const,
    label: record.title,
    sourceRecordId: record.evidenceId,
    sourceLayer: "v39-evidence-intelligence-network",
    evidenceId: record.evidenceId,
    evidenceKind: record.evidenceKind,
    evidenceStatus: record.evidenceStatus,
    brandId: record.brandId,
    mode: "evidence-intelligence-network" as const,
  }));
}

export function buildSkuGraphNodes(): SKUNode[] {
  const nodeMap = new Map<string, SKUNode>();

  for (const link of buildSkuLinkRecords()) {
    const nodeId = buildSkuGraphNodeId(link.brandId, link.sku);
    if (nodeMap.has(nodeId)) continue;
    nodeMap.set(nodeId, {
      nodeId,
      nodeType: "sku",
      label: link.sku,
      sourceRecordId: link.linkId,
      sourceLayer: "v38-brand-intelligence-network",
      sku: link.sku,
      brandId: link.brandId,
      productId: link.productId,
      mode: "evidence-intelligence-network",
    });
  }

  for (const record of buildEvidenceRegistryRecords()) {
    if (!record.sku) continue;
    const nodeId = buildSkuGraphNodeId(record.brandId, record.sku);
    if (nodeMap.has(nodeId)) continue;
    nodeMap.set(nodeId, {
      nodeId,
      nodeType: "sku",
      label: record.sku,
      sourceRecordId: record.brandLinkId,
      sourceLayer: "v39-evidence-intelligence-network",
      sku: record.sku,
      brandId: record.brandId,
      mode: "evidence-intelligence-network",
    });
  }

  return [...nodeMap.values()];
}

export function buildManufacturerGraphNodes(): ManufacturerNode[] {
  return buildManufacturerRegistryRecords().map((manufacturer) => ({
    nodeId: buildManufacturerGraphNodeId(manufacturer.manufacturerId),
    nodeType: "manufacturer" as const,
    label: manufacturer.manufacturerName,
    sourceRecordId: manufacturer.manufacturerId,
    sourceLayer: "v38-brand-intelligence-network",
    manufacturerId: manufacturer.manufacturerId,
    manufacturerName: manufacturer.manufacturerName,
    region: manufacturer.region,
    mode: "evidence-intelligence-network" as const,
  }));
}

export function buildEvidenceGraphNodeRecords(): EvidenceGraphNode[] {
  return [
    ...buildBrandGraphNodes(),
    ...buildEvidenceGraphNodes(),
    ...buildSkuGraphNodes(),
    ...buildManufacturerGraphNodes(),
  ];
}
