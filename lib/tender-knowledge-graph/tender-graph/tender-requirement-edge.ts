import { buildRequirementRegistryRecords } from "@/lib/requirement-intelligence";
import { buildTenderRegistryRecords } from "../tender-registry";
import { CANONICAL_TENDER_GRAPH_TENDER_ID } from "../shared/constants";
import { buildTenderGraphEdge } from "./graph-edges";
import {
  buildTenderGraphNodeId,
  buildTkgRequirementNodeId,
} from "./graph-nodes";
import type { TenderGraphEdge } from "../shared/types";

export function buildTkgTenderRequirementEdgeId(
  tenderId: string,
  requirementId: string,
): string {
  return `tkg-edge-tender-requirement-${tenderId}-${requirementId}`;
}

function resolveAnchorRequirement() {
  return (
    buildRequirementRegistryRecords().find(
      (record) => record.tenderId === CANONICAL_TENDER_GRAPH_TENDER_ID,
    ) ?? buildRequirementRegistryRecords()[0]
  );
}

export function buildTenderRequirementEdges(): TenderGraphEdge[] {
  const edges: TenderGraphEdge[] = [];
  const seen = new Set<string>();
  const coveredTenders = new Set<string>();

  for (const record of buildRequirementRegistryRecords()) {
    const edgeId = buildTkgTenderRequirementEdgeId(record.tenderId, record.requirementId);
    if (seen.has(edgeId)) continue;
    seen.add(edgeId);
    coveredTenders.add(record.tenderId);
    edges.push(
      buildTenderGraphEdge({
        edgeId,
        type: "tender-requirement",
        sourceId: record.tenderId,
        targetId: record.requirementId,
        sourceNodeId: buildTenderGraphNodeId(record.tenderId),
        targetNodeId: buildTkgRequirementNodeId(record.requirementId),
        weight: Math.max(10, Math.round(record.score.totalRequirementScore * 0.6)),
        traceRef: record.requirementRef,
        sourceRecordId: record.requirementId,
      }),
    );
  }

  const anchor = resolveAnchorRequirement();
  if (anchor) {
    for (const tender of buildTenderRegistryRecords()) {
      if (coveredTenders.has(tender.tenderId)) continue;
      const edgeId = buildTkgTenderRequirementEdgeId(tender.tenderId, anchor.requirementId);
      if (seen.has(edgeId)) continue;
      seen.add(edgeId);
      coveredTenders.add(tender.tenderId);
      edges.push(
        buildTenderGraphEdge({
          edgeId,
          type: "tender-requirement",
          sourceId: tender.tenderId,
          targetId: anchor.requirementId,
          sourceNodeId: buildTenderGraphNodeId(tender.tenderId),
          targetNodeId: buildTkgRequirementNodeId(anchor.requirementId),
          weight: 20,
          traceRef: anchor.requirementRef,
          sourceRecordId: anchor.requirementId,
        }),
      );
    }
  }

  return edges;
}
