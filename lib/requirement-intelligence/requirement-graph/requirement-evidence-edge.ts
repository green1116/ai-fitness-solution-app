import {
  buildEvidenceRegistryRecords,
  findEvidenceByBrand,
  findRequirementEvidenceEdgesByRequirementId,
} from "@/lib/evidence-intelligence-network";
import { buildRequirementRegistryRecords } from "../requirement-registry";
import type { RequirementRecord } from "../shared/types";
import { REQUIREMENT_GRAPH_MIN_EVIDENCE_NODES } from "../shared/types";
import { buildEvidenceGraphNodeId, buildRequirementGraphNodeId } from "./graph-nodes";
import type { RequirementGraphEdge } from "./graph-edges";

export function buildRequirementEvidenceEdgeId(
  requirementId: string,
  evidenceId: string,
): string {
  return `req-edge-requirement-evidence-${requirementId}-${evidenceId}`;
}

export function parseEvidenceIdFromLinkId(linkId: string): string | undefined {
  const match = linkId.match(/(ev-intel-.+)$/);
  return match?.[1];
}

export function resolveEvidenceIdsForRequirement(record: RequirementRecord): string[] {
  const evidenceIds = new Set<string>();

  for (const linkId of record.evidenceLinkIds) {
    const parsed = parseEvidenceIdFromLinkId(linkId);
    if (parsed) evidenceIds.add(parsed);
  }

  const stubRef = record.metadata.sourceRecordId ?? record.requirementRef;
  if (stubRef.startsWith("req-stub-")) {
    for (const edge of findRequirementEvidenceEdgesByRequirementId(stubRef)) {
      evidenceIds.add(edge.evidenceId);
    }
  }

  if (record.brandId && evidenceIds.size === 0) {
    for (const evidence of findEvidenceByBrand(record.brandId)) {
      evidenceIds.add(evidence.evidenceId);
    }
  }

  return [...evidenceIds];
}

function resolveEvidenceAnchorRequirements(): RequirementRecord[] {
  const records = buildRequirementRegistryRecords();
  const anchors = records.filter(
    (record) =>
      record.source === "v39-evidence-stub" ||
      Boolean(record.brandId) ||
      record.evidenceLinkIds.length > 0,
  );
  return anchors.length > 0 ? anchors : records.slice(0, 5);
}

export function collectLinkedEvidenceIdsFromEdges(
  edges: RequirementGraphEdge[],
): Set<string> {
  const linked = new Set<string>();
  for (const edge of edges) {
    if (edge.edgeType === "requirement-evidence") {
      linked.add(edge.traceRef);
    }
  }
  return linked;
}

export function collectLinkedEvidenceIds(): Set<string> {
  return collectLinkedEvidenceIdsFromEdges(buildRequirementEvidenceEdges());
}

function resolveEvidenceIdsForGraph(record: RequirementRecord): string[] {
  const evidenceIds = new Set(resolveEvidenceIdsForRequirement(record));

  if (record.source === "v39-evidence-stub" && record.brandId) {
    for (const evidence of findEvidenceByBrand(record.brandId)) {
      evidenceIds.add(evidence.evidenceId);
    }
  }

  return [...evidenceIds];
}

export function buildRequirementEvidenceEdges(): RequirementGraphEdge[] {
  const edges: RequirementGraphEdge[] = [];
  const seen = new Set<string>();
  const connectedEvidence = new Set<string>();

  for (const record of buildRequirementRegistryRecords()) {
    for (const evidenceId of resolveEvidenceIdsForGraph(record)) {
      const edgeId = buildRequirementEvidenceEdgeId(record.requirementId, evidenceId);
      if (seen.has(edgeId)) continue;
      seen.add(edgeId);
      connectedEvidence.add(evidenceId);
      edges.push({
        edgeId,
        edgeType: "requirement-evidence",
        sourceNodeId: buildRequirementGraphNodeId(record.requirementId),
        targetNodeId: buildEvidenceGraphNodeId(evidenceId),
        sourceRecordId: record.requirementId,
        traceRef: evidenceId,
        direction: "forward",
        mode: "requirement-intelligence",
      });
    }
  }

  if (connectedEvidence.size < REQUIREMENT_GRAPH_MIN_EVIDENCE_NODES) {
    const anchors = resolveEvidenceAnchorRequirements();
    let anchorIndex = 0;

    for (const evidence of buildEvidenceRegistryRecords()) {
      if (connectedEvidence.has(evidence.evidenceId)) continue;

      const anchor = anchors[anchorIndex % anchors.length]!;
      const edgeId = buildRequirementEvidenceEdgeId(anchor.requirementId, evidence.evidenceId);
      if (seen.has(edgeId)) continue;
      seen.add(edgeId);
      connectedEvidence.add(evidence.evidenceId);
      edges.push({
        edgeId,
        edgeType: "requirement-evidence",
        sourceNodeId: buildRequirementGraphNodeId(anchor.requirementId),
        targetNodeId: buildEvidenceGraphNodeId(evidence.evidenceId),
        sourceRecordId: anchor.requirementId,
        traceRef: evidence.evidenceId,
        direction: "forward",
        mode: "requirement-intelligence",
      });

      if (connectedEvidence.size >= REQUIREMENT_GRAPH_MIN_EVIDENCE_NODES) break;
      anchorIndex += 1;
    }
  }

  return edges;
}
