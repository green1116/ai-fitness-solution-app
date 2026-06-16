import { buildSupplierLinkRecords } from "@/lib/brand-intelligence-network";
import { getSupplierById } from "@/lib/regional-supplier-foundation";
import type { CompetitorBrandNode, CompetitorSupplierNode } from "./competition-types";
import { buildCompetitorSupplierNodeId } from "./competition-node";

function resolveSupplierAdvantage(authorizationLevel: string, linkStatus: string): number {
  const authScore =
    authorizationLevel === "national" ? 85 : authorizationLevel === "regional" ? 70 : 55;
  const statusScore = linkStatus === "active" ? 15 : 5;
  return Math.min(100, authScore + statusScore - 10);
}

export function buildCompetitorSupplierNodes(
  brandNodes: CompetitorBrandNode[],
): CompetitorSupplierNode[] {
  const nodes: CompetitorSupplierNode[] = [];
  const seen = new Set<string>();

  for (const brandNode of brandNodes) {
    const links = buildSupplierLinkRecords().filter((link) => link.brandId === brandNode.brandId);
    for (const link of links) {
      const nodeId = buildCompetitorSupplierNodeId(
        link.supplierId,
        brandNode.brandId,
        brandNode.tenderId,
      );
      if (seen.has(nodeId)) continue;
      seen.add(nodeId);

      const supplier = getSupplierById(link.supplierId);
      nodes.push({
        nodeId,
        nodeType: "competitor-supplier",
        label: supplier?.supplierName ?? link.supplierId,
        sourceRecordId: link.supplierId,
        sourceLayer: "v38-brand-intelligence-network",
        supplierId: link.supplierId,
        brandId: brandNode.brandId,
        region: link.region,
        authorizationLevel: supplier?.authorizationLevel ?? "regional",
        supplierAdvantage: resolveSupplierAdvantage(
          supplier?.authorizationLevel ?? "regional",
          link.linkStatus,
        ),
        linkStatus: link.linkStatus,
        mode: "tender-knowledge-graph",
      });
    }
  }

  return nodes;
}
