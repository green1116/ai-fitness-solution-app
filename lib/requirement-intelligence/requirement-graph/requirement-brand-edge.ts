import { buildBrandRegistryRecords } from "@/lib/brand-intelligence-network";
import { buildRequirementRegistryRecords } from "../requirement-registry";
import {
  buildBrandGraphNodeId,
  buildRequirementGraphNodeId,
} from "./graph-nodes";
import type { RequirementGraphEdge } from "./graph-edges";

export function buildRequirementBrandEdgeId(requirementId: string, brandId: string): string {
  return `req-edge-requirement-brand-${requirementId}-${brandId}`;
}

function resolveBrandAnchorRequirement() {
  return (
    buildRequirementRegistryRecords().find(
      (record) =>
        record.tenderId === "tender-sh-commercial-gym-2025-001" &&
        record.source === "v39-evidence-stub",
    ) ?? buildRequirementRegistryRecords().find((record) => record.brandId)
  );
}

export function buildRequirementBrandEdges(): RequirementGraphEdge[] {
  const edges: RequirementGraphEdge[] = [];
  const seen = new Set<string>();
  const connectedBrands = new Set<string>();

  for (const record of buildRequirementRegistryRecords()) {
    if (!record.brandId) continue;
    const edgeId = buildRequirementBrandEdgeId(record.requirementId, record.brandId);
    if (seen.has(edgeId)) continue;
    seen.add(edgeId);
    connectedBrands.add(record.brandId);
    edges.push({
      edgeId,
      edgeType: "requirement-brand",
      sourceNodeId: buildRequirementGraphNodeId(record.requirementId),
      targetNodeId: buildBrandGraphNodeId(record.brandId),
      sourceRecordId: record.requirementId,
      traceRef: record.brandId,
      direction: "bidirectional",
      mode: "requirement-intelligence",
    });
  }

  const anchorRequirement = resolveBrandAnchorRequirement();
  if (anchorRequirement) {
    for (const brand of buildBrandRegistryRecords()) {
      if (connectedBrands.has(brand.brandId)) continue;
      const edgeId = buildRequirementBrandEdgeId(anchorRequirement.requirementId, brand.brandId);
      if (seen.has(edgeId)) continue;
      seen.add(edgeId);
      connectedBrands.add(brand.brandId);
      edges.push({
        edgeId,
        edgeType: "requirement-brand",
        sourceNodeId: buildRequirementGraphNodeId(anchorRequirement.requirementId),
        targetNodeId: buildBrandGraphNodeId(brand.brandId),
        sourceRecordId: anchorRequirement.requirementId,
        traceRef: brand.brandId,
        direction: "bidirectional",
        mode: "requirement-intelligence",
      });
    }
  }

  return edges;
}
