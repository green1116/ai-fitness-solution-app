import {
  buildEvidenceRegistryRecords,
  findEvidenceByBrand,
  findRequirementEvidenceEdgesByRequirementId,
} from "@/lib/evidence-intelligence-network";
import { buildRequirementRegistryRecords } from "@/lib/requirement-intelligence";
import type { RequirementRecord } from "@/lib/requirement-intelligence/shared/types";
import { TKG_MIN_EVIDENCE_COUNT } from "../shared/types";
import { buildTenderGraphEdge } from "./graph-edges";
import {
  buildTkgEvidenceNodeId,
  buildTkgRequirementNodeId,
} from "./graph-nodes";
import type { TenderGraphEdge } from "../shared/types";

function parseEvidenceIdFromLinkId(linkId: string): string | undefined {
  const match = linkId.match(/(ev-intel-.+)$/);
  return match?.[1];
}

export function resolveTkgEvidenceIdsForRequirement(record: RequirementRecord): string[] {
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

export function buildTkgRequirementEvidenceEdgeId(
  requirementId: string,
  evidenceId: string,
): string {
  return `tkg-edge-requirement-evidence-${requirementId}-${evidenceId}`;
}

export function collectLinkedEvidenceIdsFromTkgEdges(edges: TenderGraphEdge[]): Set<string> {
  const linked = new Set<string>();
  for (const edge of edges) {
    if (edge.type === "requirement-evidence") {
      linked.add(edge.traceRef);
    }
  }
  return linked;
}

export function buildRequirementEvidenceEdges(): TenderGraphEdge[] {
  const edges: TenderGraphEdge[] = [];
  const seen = new Set<string>();
  const connectedEvidence = new Set<string>();
  const connectedRequirements = new Set<string>();

  for (const record of buildRequirementRegistryRecords()) {
    for (const evidenceId of resolveTkgEvidenceIdsForRequirement(record)) {
      const edgeId = buildTkgRequirementEvidenceEdgeId(record.requirementId, evidenceId);
      if (seen.has(edgeId)) continue;
      seen.add(edgeId);
      connectedEvidence.add(evidenceId);
      connectedRequirements.add(record.requirementId);
      edges.push(
        buildTenderGraphEdge({
          edgeId,
          type: "requirement-evidence",
          sourceId: record.requirementId,
          targetId: evidenceId,
          sourceNodeId: buildTkgRequirementNodeId(record.requirementId),
          targetNodeId: buildTkgEvidenceNodeId(evidenceId),
          weight: Math.max(15, Math.round(record.coverageScore * 0.5)),
          traceRef: evidenceId,
          sourceRecordId: record.requirementId,
        }),
      );
    }
  }

  const anchorEvidence =
    buildEvidenceRegistryRecords().find((record) => record.evidenceId)?.evidenceId ??
    buildEvidenceRegistryRecords()[0]?.evidenceId;

  if (anchorEvidence) {
    for (const record of buildRequirementRegistryRecords()) {
      if (connectedRequirements.has(record.requirementId)) continue;
      const edgeId = buildTkgRequirementEvidenceEdgeId(record.requirementId, anchorEvidence);
      if (seen.has(edgeId)) continue;
      seen.add(edgeId);
      connectedEvidence.add(anchorEvidence);
      connectedRequirements.add(record.requirementId);
      edges.push(
        buildTenderGraphEdge({
          edgeId,
          type: "requirement-evidence",
          sourceId: record.requirementId,
          targetId: anchorEvidence,
          sourceNodeId: buildTkgRequirementNodeId(record.requirementId),
          targetNodeId: buildTkgEvidenceNodeId(anchorEvidence),
          weight: 15,
          traceRef: anchorEvidence,
          sourceRecordId: record.requirementId,
        }),
      );
    }
  }

  if (connectedEvidence.size < TKG_MIN_EVIDENCE_COUNT) {
    const anchors = buildRequirementRegistryRecords().filter(
      (record) => record.brandId || record.evidenceLinkIds.length > 0,
    );
    let anchorIndex = 0;

    for (const evidence of buildEvidenceRegistryRecords()) {
      if (connectedEvidence.has(evidence.evidenceId)) continue;
      const anchor = anchors[anchorIndex % Math.max(anchors.length, 1)]!;
      const edgeId = buildTkgRequirementEvidenceEdgeId(anchor.requirementId, evidence.evidenceId);
      if (seen.has(edgeId)) continue;
      seen.add(edgeId);
      connectedEvidence.add(evidence.evidenceId);
      edges.push(
        buildTenderGraphEdge({
          edgeId,
          type: "requirement-evidence",
          sourceId: anchor.requirementId,
          targetId: evidence.evidenceId,
          sourceNodeId: buildTkgRequirementNodeId(anchor.requirementId),
          targetNodeId: buildTkgEvidenceNodeId(evidence.evidenceId),
          weight: Math.max(12, Math.round(evidence.score.totalEvidenceScore * 0.4)),
          traceRef: evidence.evidenceId,
          sourceRecordId: anchor.requirementId,
        }),
      );
      if (connectedEvidence.size >= TKG_MIN_EVIDENCE_COUNT) break;
      anchorIndex += 1;
    }
  }

  return edges;
}
