import { findProductById } from "@/lib/equivalent-product-intelligence";
import { PI_CANONICAL_ID } from "../shared/constants";
import { buildSupplierCapabilityRegistry } from "../supplier-foundation/supplier-capability-registry";
import { buildSupplierRegistry } from "../supplier-foundation/supplier-registry";
import type { ProcurementSupplierLink } from "./procurement-match-types";
import { buildProcurementRequirementLinks } from "./procurement-requirement-link";

let cachedLinks: ProcurementSupplierLink[] | undefined;

function collectDecisionProductIds(): Set<string> {
  const productIds = new Set<string>();
  for (const link of buildProcurementRequirementLinks()) {
    productIds.add(link.productId);
  }
  return productIds;
}

export function buildProcurementSupplierLinks(): ProcurementSupplierLink[] {
  if (cachedLinks) return cachedLinks;

  const links: ProcurementSupplierLink[] = [];
  const suppliers = buildSupplierRegistry().records;
  const capabilities = buildSupplierCapabilityRegistry().records;
  const productIds = collectDecisionProductIds();

  for (const capability of capabilities) {
    links.push({
      linkId: `pi-supplier-capability-${capability.supplierId}-${capability.capabilityTag}`,
      supplierId: capability.supplierId,
      capabilityTag: capability.capabilityTag,
      linkType: "supplier-capability",
      mode: PI_CANONICAL_ID,
    });
  }

  for (const supplier of suppliers) {
    for (const productId of productIds) {
      const product = findProductById(productId);
      if (!product?.brandId) continue;
      if (supplier.brandIds.length > 0 && !supplier.brandIds.includes(product.brandId)) {
        continue;
      }
      if (supplier.brandIds.length === 0) continue;

      links.push({
        linkId: `pi-supplier-product-${supplier.id}-${productId}`,
        supplierId: supplier.id,
        productId,
        brandId: product.brandId,
        linkType: "supplier-product",
        mode: PI_CANONICAL_ID,
      });
    }
  }

  cachedLinks = links;
  return links;
}
