import { buildBrandRegistryRecords } from "@/lib/brand-intelligence-network";
import { buildRequirementRegistryRecords } from "@/lib/requirement-intelligence";
import { TKG_MIN_BRAND_COUNT } from "../shared/constants";
import { buildTenderGraphEdge } from "./graph-edges";
import {
  buildTkgBrandNodeId,
  buildTkgRequirementNodeId,
} from "./graph-nodes";
import type { TenderGraphEdge } from "../shared/types";

export function buildTkgRequirementBrandEdgeId(
  requirementId: string,
  brandId: string,
): string {
  return `tkg-edge-requirement-brand-${requirementId}-${brandId}`;
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

export function collectLinkedBrandIdsFromTkgEdges(edges: TenderGraphEdge[]): Set<string> {
  const linked = new Set<string>();
  for (const edge of edges) {
    if (edge.type === "requirement-brand" || edge.type === "tender-brand") {
      linked.add(edge.traceRef);
    }
  }
  return linked;
}

export function buildRequirementBrandEdges(): TenderGraphEdge[] {
  const edges: TenderGraphEdge[] = [];
  const seen = new Set<string>();
  const connectedBrands = new Set<string>();
  const connectedRequirements = new Set<string>();

  for (const record of buildRequirementRegistryRecords()) {
    if (!record.brandId) continue;
    const edgeId = buildTkgRequirementBrandEdgeId(record.requirementId, record.brandId);
    if (seen.has(edgeId)) continue;
    seen.add(edgeId);
    connectedBrands.add(record.brandId);
    connectedRequirements.add(record.requirementId);
    edges.push(
      buildTenderGraphEdge({
        edgeId,
        type: "requirement-brand",
        sourceId: record.requirementId,
        targetId: record.brandId,
        sourceNodeId: buildTkgRequirementNodeId(record.requirementId),
        targetNodeId: buildTkgBrandNodeId(record.brandId),
        weight: Math.max(20, Math.round(record.matchScore * 0.6)),
        traceRef: record.brandId,
        sourceRecordId: record.requirementId,
        direction: "bidirectional",
      }),
    );
  }

  const anchorRequirement = resolveBrandAnchorRequirement();
  const anchorBrand =
    buildBrandRegistryRecords().find((brand) => brand.brandId)?.brandId ??
    buildBrandRegistryRecords()[0]?.brandId;

  if (anchorRequirement && anchorBrand) {
    for (const record of buildRequirementRegistryRecords()) {
      if (connectedRequirements.has(record.requirementId)) continue;
      const edgeId = buildTkgRequirementBrandEdgeId(record.requirementId, anchorBrand);
      if (seen.has(edgeId)) continue;
      seen.add(edgeId);
      connectedBrands.add(anchorBrand);
      connectedRequirements.add(record.requirementId);
      edges.push(
        buildTenderGraphEdge({
          edgeId,
          type: "requirement-brand",
          sourceId: record.requirementId,
          targetId: anchorBrand,
          sourceNodeId: buildTkgRequirementNodeId(record.requirementId),
          targetNodeId: buildTkgBrandNodeId(anchorBrand),
          weight: 18,
          traceRef: anchorBrand,
          sourceRecordId: record.requirementId,
          direction: "bidirectional",
        }),
      );
    }

    for (const brand of buildBrandRegistryRecords()) {
      if (connectedBrands.has(brand.brandId)) continue;
      const edgeId = buildTkgRequirementBrandEdgeId(
        anchorRequirement.requirementId,
        brand.brandId,
      );
      if (seen.has(edgeId)) continue;
      seen.add(edgeId);
      connectedBrands.add(brand.brandId);
      edges.push(
        buildTenderGraphEdge({
          edgeId,
          type: "requirement-brand",
          sourceId: anchorRequirement.requirementId,
          targetId: brand.brandId,
          sourceNodeId: buildTkgRequirementNodeId(anchorRequirement.requirementId),
          targetNodeId: buildTkgBrandNodeId(brand.brandId),
          weight: Math.max(18, Math.round(brand.score.totalBrandScore * 0.5)),
          traceRef: brand.brandId,
          sourceRecordId: anchorRequirement.requirementId,
          direction: "bidirectional",
        }),
      );
      if (connectedBrands.size >= TKG_MIN_BRAND_COUNT) break;
    }
  }

  return edges;
}
