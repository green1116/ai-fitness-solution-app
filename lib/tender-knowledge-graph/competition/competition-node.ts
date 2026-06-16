import type { CompetitionNodeType } from "./competition-types";

export function buildCompetitorBrandNodeId(tenderId: string, brandId: string): string {
  return `tkg-comp-node-brand-${tenderId}-${brandId}`;
}

export function buildCompetitorSupplierNodeId(
  supplierId: string,
  brandId?: string,
  tenderId?: string,
): string {
  if (tenderId && brandId) {
    return `tkg-comp-node-supplier-${tenderId}-${brandId}-${supplierId}`;
  }
  if (brandId) {
    return `tkg-comp-node-supplier-${brandId}-${supplierId}`;
  }
  return `tkg-comp-node-supplier-${supplierId}`;
}

export function buildAlternativeSolutionNodeId(alternativeId: string): string {
  return `tkg-comp-node-alt-${alternativeId}`;
}

export function buildCompetitionTenderRootNodeId(tenderId: string): string {
  return `tkg-comp-root-tender-${tenderId}`;
}

export function parseCompetitionNodeType(nodeId: string): CompetitionNodeType | undefined {
  if (nodeId.includes("-comp-node-brand-")) return "competitor-brand";
  if (nodeId.includes("-comp-node-supplier-")) return "competitor-supplier";
  if (nodeId.includes("-comp-node-alt-")) return "alternative-solution";
  return undefined;
}
