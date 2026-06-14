import { buildEvidenceRegistryRecords } from "../evidence-registry";
import { buildEvidenceGraphNodeId, buildSkuGraphNodeId } from "./graph-nodes";
import type { EvidenceGraphEdge } from "./graph-edges";

export function buildSkuEvidenceEdgeId(sku: string, evidenceId: string): string {
  return `edge-sku-evidence-${sku.toLowerCase()}-${evidenceId}`;
}

export function buildSkuEvidenceEdges(): EvidenceGraphEdge[] {
  return buildEvidenceRegistryRecords()
    .filter((record) => Boolean(record.sku))
    .map((record) => ({
      edgeId: buildSkuEvidenceEdgeId(record.sku!, record.evidenceId),
      edgeType: "sku-evidence" as const,
      sourceNodeId: buildSkuGraphNodeId(record.brandId, record.sku!),
      targetNodeId: buildEvidenceGraphNodeId(record.evidenceId),
      sourceRecordId: record.brandLinkId,
      traceRef: record.evidenceRef,
      direction: "forward" as const,
      mode: "evidence-intelligence-network" as const,
    }));
}
