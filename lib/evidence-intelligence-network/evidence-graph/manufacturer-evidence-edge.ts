import { buildEvidenceRegistryRecords } from "../evidence-registry";
import { buildEvidenceGraphNodeId, buildManufacturerGraphNodeId } from "./graph-nodes";
import type { EvidenceGraphEdge } from "./graph-edges";

export function buildManufacturerEvidenceEdgeId(
  manufacturerId: string,
  evidenceId: string,
): string {
  return `edge-mfr-evidence-${manufacturerId}-${evidenceId}`;
}

export function buildManufacturerEvidenceEdges(): EvidenceGraphEdge[] {
  return buildEvidenceRegistryRecords()
    .filter((record) => Boolean(record.manufacturerId))
    .map((record) => ({
      edgeId: buildManufacturerEvidenceEdgeId(record.manufacturerId!, record.evidenceId),
      edgeType: "manufacturer-evidence" as const,
      sourceNodeId: buildManufacturerGraphNodeId(record.manufacturerId!),
      targetNodeId: buildEvidenceGraphNodeId(record.evidenceId),
      sourceRecordId: record.brandLinkId,
      traceRef: record.evidenceRef,
      direction: "forward" as const,
      mode: "evidence-intelligence-network" as const,
    }));
}
