import { findProductById, runEquivalentDecisionEngine } from "@/lib/equivalent-product-intelligence";
import { PI_CANONICAL_ID } from "../shared/constants";
import { buildSupplierCapabilityRegistry } from "../supplier-foundation/supplier-capability-registry";
import { buildSupplierRegistry } from "../supplier-foundation/supplier-registry";
import type { ProcurementMatchContext } from "./procurement-match-types";
import { buildProcurementRequirementLinks } from "./procurement-requirement-link";
import { buildProcurementSupplierLinks } from "./procurement-supplier-link";

let cachedContext: ProcurementMatchContext | undefined;

export function buildProcurementMatchContext(): ProcurementMatchContext {
  if (cachedContext) return cachedContext;

  const requirementLinks = buildProcurementRequirementLinks();
  const supplierLinks = buildProcurementSupplierLinks();
  const suppliers = buildSupplierRegistry().records;
  const capabilities = buildSupplierCapabilityRegistry().records;
  const decisions = requirementLinks
    .map((link) => runEquivalentDecisionEngine(link.requirementId))
    .filter((decision): decision is NonNullable<typeof decision> => Boolean(decision));

  cachedContext = {
    contextId: "pi-procurement-match-context-v43-p1b",
    requirementLinks,
    supplierLinks,
    requirements: requirementLinks.map((link) => link.requirementId),
    decisions,
    suppliers,
    capabilities,
    mode: PI_CANONICAL_ID,
  };

  return cachedContext;
}

export function resolveProductBrandId(productId: string): string | undefined {
  return findProductById(productId)?.brandId;
}
