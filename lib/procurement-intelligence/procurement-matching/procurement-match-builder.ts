import { runEquivalentDecisionEngine } from "@/lib/equivalent-product-intelligence";
import type { ProcurementMatchRecord } from "../shared/types";
import { buildSupplierCapabilityRegistry } from "../supplier-foundation/supplier-capability-registry";
import { buildSupplierRegistry } from "../supplier-foundation/supplier-registry";
import { buildProcurementMatchContext, resolveProductBrandId } from "./procurement-match-context";
import { buildProcurementRequirementLinks } from "./procurement-requirement-link";
import { buildProcurementSupplierLinks } from "./procurement-supplier-link";
import {
  calculateProcurementMatchScore,
  resolveDecisionFitScore,
} from "./procurement-match-scoring";

let cachedMatches: ProcurementMatchRecord[] | undefined;

function resolveCapabilityFitScore(supplierId: string): number {
  const capabilities = buildSupplierCapabilityRegistry().records.filter(
    (record) => record.supplierId === supplierId,
  );
  if (capabilities.length === 0) return 0;
  return Math.max(...capabilities.map((record) => record.strengthScore));
}

function resolveBrandFitScore(supplierId: string, productBrandId?: string): number {
  if (!productBrandId) return 30;
  const supplier = buildSupplierRegistry().records.find((record) => record.id === supplierId);
  if (!supplier) return 0;
  if (supplier.brandIds.includes(productBrandId)) return 100;
  return supplier.brandIds.length === 0 ? 55 : 25;
}

export function buildProcurementMatches(requirementId?: string): ProcurementMatchRecord[] {
  if (!requirementId && cachedMatches) return cachedMatches;

  const requirementLinks = buildProcurementRequirementLinks().filter((link) =>
    requirementId ? link.requirementId === requirementId : true,
  );
  const supplierProductLinks = buildProcurementSupplierLinks().filter(
    (link) => link.linkType === "supplier-product" && link.productId,
  );
  const matches: ProcurementMatchRecord[] = [];
  const seen = new Set<string>();

  for (const requirementLink of requirementLinks) {
    const decision = runEquivalentDecisionEngine(requirementLink.requirementId);
    if (!decision) continue;

    const candidateProductIds = [
      decision.optimalProductId,
      ...decision.candidateProductIds,
    ];
    const relevantSupplierLinks = supplierProductLinks.filter(
      (link) => link.productId && candidateProductIds.includes(link.productId),
    );

    for (const supplierLink of relevantSupplierLinks) {
      const productId = supplierLink.productId!;
      const dedupeKey = `${requirementLink.requirementId}:${decision.decisionId}:${supplierLink.supplierId}:${productId}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      const productBrandId = resolveProductBrandId(productId);
      const score = calculateProcurementMatchScore({
        capabilityFitScore: resolveCapabilityFitScore(supplierLink.supplierId),
        brandFitScore: resolveBrandFitScore(supplierLink.supplierId, productBrandId),
        decisionFitScore: resolveDecisionFitScore(decision.decisionLevel),
      });

      matches.push({
        requirementId: requirementLink.requirementId,
        decisionId: decision.decisionId,
        supplierId: supplierLink.supplierId,
        productId,
        matchScore: score.matchScore,
        procurementFitScore: score.procurementFitScore,
        deliveryFitScore: score.deliveryFitScore,
        priceFitScore: score.priceFitScore,
        availabilityFitScore: score.availabilityFitScore,
        evidenceFitScore: score.evidenceFitScore,
      });
    }
  }

  if (!requirementId) {
    cachedMatches = matches;
  }

  return matches;
}

export function getProcurementMatchContextSummary(): string {
  const context = buildProcurementMatchContext();
  return `requirements=${context.requirements.length} decisions=${context.decisions.length} suppliers=${context.suppliers.length} capabilities=${context.capabilities.length}`;
}
