import type { CatalogBundle, CatalogType, IndustrySector } from "./shared/types";
import { getCatalogProductsBySector, getCatalogProductsByType } from "./catalog-product";

export function buildCatalogBundle(input: {
  catalogId: string;
  proposalId: string;
  catalogType: CatalogType;
  industrySector: IndustrySector;
}): CatalogBundle {
  const typeProducts = getCatalogProductsByType(input.catalogType);
  const sectorProducts = getCatalogProductsBySector(input.industrySector);
  const matchedProducts =
    sectorProducts.length > 0
      ? sectorProducts.slice(0, 3)
      : typeProducts.slice(0, 3);

  const productIds = matchedProducts.map((product) => product.productId);

  return {
    bundleId: `catalog-bundle-${input.catalogId}`,
    catalogId: input.catalogId,
    proposalId: input.proposalId,
    productIds,
    productCount: productIds.length,
    bundleReady: productIds.length >= 1,
    mode: "product-catalog",
  };
}
