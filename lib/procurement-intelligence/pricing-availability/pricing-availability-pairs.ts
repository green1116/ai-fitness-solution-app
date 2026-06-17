import { buildSupplierRegistry } from "../supplier-foundation/supplier-registry";
import { buildProcurementMatches } from "../procurement-matching/procurement-match-builder";
import { buildProcurementRequirementLinks } from "../procurement-matching/procurement-requirement-link";
import { buildProcurementSupplierLinks } from "../procurement-matching/procurement-supplier-link";
import { resolveProductBrandId } from "../procurement-matching/procurement-match-context";

export interface PricingAvailabilityPair {
  supplierId: string;
  productId: string;
}

export function collectPricingAvailabilityPairs(): PricingAvailabilityPair[] {
  const seen = new Set<string>();
  const pairs: PricingAvailabilityPair[] = [];

  function addPair(supplierId: string, productId: string): void {
    const key = `${supplierId}:${productId}`;
    if (seen.has(key)) return;
    seen.add(key);
    pairs.push({ supplierId, productId });
  }

  for (const match of buildProcurementMatches()) {
    addPair(match.supplierId, match.productId);
  }

  for (const link of buildProcurementSupplierLinks()) {
    if (link.linkType === "supplier-product" && link.productId) {
      addPair(link.supplierId, link.productId);
    }
  }

  const productIds = new Set<string>();
  for (const link of buildProcurementRequirementLinks()) {
    productIds.add(link.productId);
  }
  for (const match of buildProcurementMatches()) {
    productIds.add(match.productId);
  }
  const orderedProductIds = [...productIds];

  for (const supplier of buildSupplierRegistry().records) {
    if (supplier.brandIds.length === 0) {
      // Fallback for stub suppliers without brand binding: always generate at least one pair.
      if (orderedProductIds.length === 0) {
        addPair(supplier.id, "pi-product-fallback-generic");
        continue;
      }
      for (const productId of orderedProductIds) {
        addPair(supplier.id, productId);
      }
      continue;
    }

    for (const productId of orderedProductIds) {
      const brandId = resolveProductBrandId(productId);
      if (brandId && supplier.brandIds.includes(brandId)) {
        addPair(supplier.id, productId);
      }
    }
  }

  return pairs;
}
