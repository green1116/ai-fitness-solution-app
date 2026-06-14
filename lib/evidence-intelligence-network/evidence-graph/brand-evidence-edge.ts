import { buildBrandRegistryRecords, buildSkuLinkRecords } from "@/lib/brand-intelligence-network";
import { buildEvidenceRegistryRecords } from "../evidence-registry";
import {
  buildBrandGraphNodeId,
  buildEvidenceGraphNodeId,
  buildManufacturerGraphNodeId,
  buildSkuGraphNodeId,
} from "./graph-nodes";
import type { EvidenceGraphEdge } from "./graph-edges";

export function buildBrandEvidenceEdgeId(brandId: string, evidenceId: string): string {
  return `edge-brand-evidence-${brandId}-${evidenceId}`;
}

export function buildBrandEvidenceEdges(): EvidenceGraphEdge[] {
  return buildEvidenceRegistryRecords().map((record) => ({
    edgeId: buildBrandEvidenceEdgeId(record.brandId, record.evidenceId),
    edgeType: "brand-evidence" as const,
    sourceNodeId: buildBrandGraphNodeId(record.brandId),
    targetNodeId: buildEvidenceGraphNodeId(record.evidenceId),
    sourceRecordId: record.brandLinkId,
    traceRef: record.evidenceRef,
    direction: "forward" as const,
    mode: "evidence-intelligence-network" as const,
  }));
}

export function buildBrandSkuEdges(): EvidenceGraphEdge[] {
  const edges: EvidenceGraphEdge[] = [];
  const seen = new Set<string>();

  for (const link of buildSkuLinkRecords()) {
    const edgeId = `edge-brand-sku-${link.brandId}-${link.sku.toLowerCase()}`;
    if (seen.has(edgeId)) continue;
    seen.add(edgeId);
    edges.push({
      edgeId,
      edgeType: "brand-sku",
      sourceNodeId: buildBrandGraphNodeId(link.brandId),
      targetNodeId: buildSkuGraphNodeId(link.brandId, link.sku),
      sourceRecordId: link.linkId,
      traceRef: link.sku,
      direction: "bidirectional",
      mode: "evidence-intelligence-network",
    });
  }

  for (const record of buildEvidenceRegistryRecords()) {
    if (!record.sku) continue;
    const edgeId = `edge-brand-sku-${record.brandId}-${record.sku.toLowerCase()}`;
    if (seen.has(edgeId)) continue;
    seen.add(edgeId);
    edges.push({
      edgeId,
      edgeType: "brand-sku",
      sourceNodeId: buildBrandGraphNodeId(record.brandId),
      targetNodeId: buildSkuGraphNodeId(record.brandId, record.sku),
      sourceRecordId: record.brandLinkId,
      traceRef: record.sku,
      direction: "bidirectional",
      mode: "evidence-intelligence-network",
    });
  }

  return edges;
}

export function buildBrandManufacturerEdges(): EvidenceGraphEdge[] {
  const edges: EvidenceGraphEdge[] = [];
  const seen = new Set<string>();

  for (const brand of buildBrandRegistryRecords()) {
    if (!brand.manufacturerId) continue;
    const edgeId = `edge-brand-manufacturer-${brand.brandId}-${brand.manufacturerId}`;
    if (seen.has(edgeId)) continue;
    seen.add(edgeId);
    edges.push({
      edgeId,
      edgeType: "brand-manufacturer",
      sourceNodeId: buildBrandGraphNodeId(brand.brandId),
      targetNodeId: buildManufacturerGraphNodeId(brand.manufacturerId),
      sourceRecordId: brand.brandId,
      traceRef: brand.manufacturerId,
      direction: "bidirectional",
      mode: "evidence-intelligence-network",
    });
  }

  return edges;
}
