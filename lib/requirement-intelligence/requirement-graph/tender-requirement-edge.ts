import { buildRequirementRegistryRecords } from "../requirement-registry";
import { buildRequirementGraphNodeId, buildTenderGraphNodeId } from "./graph-nodes";
import type { RequirementGraphEdge } from "./graph-edges";

export function buildTenderRequirementEdgeId(tenderId: string, requirementId: string): string {
  return `req-edge-tender-requirement-${tenderId}-${requirementId}`;
}

export function buildTenderRequirementEdges(): RequirementGraphEdge[] {
  return buildRequirementRegistryRecords().map((record) => ({
    edgeId: buildTenderRequirementEdgeId(record.tenderId, record.requirementId),
    edgeType: "tender-requirement" as const,
    sourceNodeId: buildTenderGraphNodeId(record.tenderId),
    targetNodeId: buildRequirementGraphNodeId(record.requirementId),
    sourceRecordId: record.requirementId,
    traceRef: record.requirementRef,
    direction: "forward" as const,
    mode: "requirement-intelligence" as const,
  }));
}
