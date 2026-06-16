import { buildBrandRegistryRecords } from "@/lib/brand-intelligence-network";
import { buildRequirementRegistryRecords } from "@/lib/requirement-intelligence";
import { buildTenderRegistryRecords } from "../tender-registry";
import { buildTenderGraphEdge } from "./graph-edges";
import { buildTenderGraphNodeId, buildTkgBrandNodeId } from "./graph-nodes";
import type { TenderGraphEdge } from "../shared/types";

export function buildTkgTenderBrandEdgeId(tenderId: string, brandId: string): string {
  return `tkg-edge-tender-brand-${tenderId}-${brandId}`;
}

export function buildTenderBrandEdges(): TenderGraphEdge[] {
  const edges: TenderGraphEdge[] = [];
  const seen = new Set<string>();

  const brandsByTender = new Map<string, Map<string, number>>();

  for (const record of buildRequirementRegistryRecords()) {
    if (!record.brandId) continue;
    const bucket = brandsByTender.get(record.tenderId) ?? new Map<string, number>();
    bucket.set(record.brandId, (bucket.get(record.brandId) ?? 0) + 1);
    brandsByTender.set(record.tenderId, bucket);
  }

  for (const [tenderId, brands] of brandsByTender) {
    for (const [brandId, count] of brands) {
      const edgeId = buildTkgTenderBrandEdgeId(tenderId, brandId);
      if (seen.has(edgeId)) continue;
      seen.add(edgeId);
      edges.push(
        buildTenderGraphEdge({
          edgeId,
          type: "tender-brand",
          sourceId: tenderId,
          targetId: brandId,
          sourceNodeId: buildTenderGraphNodeId(tenderId),
          targetNodeId: buildTkgBrandNodeId(brandId),
          weight: Math.min(100, 30 + count * 12),
          traceRef: brandId,
          sourceRecordId: tenderId,
          direction: "bidirectional",
        }),
      );
    }
  }

  const coveredTenders = new Set(
    edges.filter((edge) => edge.type === "tender-brand").map((edge) => edge.sourceId),
  );
  const anchorBrand =
    buildBrandRegistryRecords().find((brand) => brand.brandId)?.brandId ??
    buildBrandRegistryRecords()[0]?.brandId;

  if (anchorBrand) {
    for (const tender of buildTenderRegistryRecords()) {
      if (coveredTenders.has(tender.tenderId)) continue;
      const edgeId = buildTkgTenderBrandEdgeId(tender.tenderId, anchorBrand);
      if (seen.has(edgeId)) continue;
      seen.add(edgeId);
      edges.push(
        buildTenderGraphEdge({
          edgeId,
          type: "tender-brand",
          sourceId: tender.tenderId,
          targetId: anchorBrand,
          sourceNodeId: buildTenderGraphNodeId(tender.tenderId),
          targetNodeId: buildTkgBrandNodeId(anchorBrand),
          weight: 25,
          traceRef: anchorBrand,
          sourceRecordId: tender.tenderId,
          direction: "bidirectional",
        }),
      );
    }
  }

  return edges;
}
