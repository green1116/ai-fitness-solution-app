import { getAllRealEquipment } from "@/lib/real-catalog-foundation";
import { getAllCatalogProducts } from "@/lib/product-catalog";
import { buildBrandRegistryRecords, findBrandByNameOrAlias } from "../brand-registry";
import type { IndustrySector, RegistryValidation, SkuLink } from "../shared/types";

export function buildSkuLinkRecords(): SkuLink[] {
  const links: SkuLink[] = [];
  const equipment = getAllRealEquipment();

  for (const item of equipment) {
    const brand = findBrandByNameOrAlias(item.brandName) ?? findBrandByNameOrAlias(item.brandId);
    if (!brand) continue;

    links.push({
      linkId: `sku-link-${brand.brandId}-${item.sku}`,
      brandId: brand.brandId,
      sku: item.sku,
      productId: `pc-product-${item.sku.toLowerCase()}`,
      catalogType: item.category,
      industrySector: "gym-equipment",
      equivalentSkuIds: [],
      linkStatus: "active",
      mode: "brand-intelligence-network",
    });
  }

  const catalogProducts = getAllCatalogProducts();
  for (const product of catalogProducts) {
    const brand = findBrandByNameOrAlias(product.brandName);
    if (!brand) continue;
    if (links.some((l) => l.brandId === brand.brandId && l.sku === product.sku)) continue;

    links.push({
      linkId: `sku-link-${brand.brandId}-${product.sku}`,
      brandId: brand.brandId,
      sku: product.sku,
      productId: product.productId,
      catalogType: product.catalogType,
      industrySector: product.industrySector as IndustrySector,
      equivalentSkuIds: [],
      linkStatus: "active",
      mode: "brand-intelligence-network",
    });
  }

  return links;
}

export function getSkuLinksByBrandId(brandId: string): SkuLink[] {
  return buildSkuLinkRecords().filter((link) => link.brandId === brandId);
}

export function getSkuLinksBySku(sku: string): SkuLink[] {
  return buildSkuLinkRecords().filter((link) => link.sku === sku);
}

export function reverseTraceSkuLink(linkId: string): SkuLink | undefined {
  return buildSkuLinkRecords().find((link) => link.linkId === linkId);
}

export function validateSkuLinkRegistry(): RegistryValidation {
  const links = buildSkuLinkRecords();
  const brandsWithSku = new Set(links.map((l) => l.brandId));
  const equipmentBrands = buildBrandRegistryRecords().filter((b) =>
    ["brand-life-fitness", "brand-technogym", "brand-matrix", "brand-shuhua"].includes(b.brandId),
  );
  const covered = equipmentBrands.filter((b) => brandsWithSku.has(b.brandId));
  let orphanCount = 0;
  for (const link of links) {
    if (!buildBrandRegistryRecords().some((b) => b.brandId === link.brandId)) orphanCount += 1;
  }

  const valid = links.length >= 8 && covered.length >= 4 && orphanCount === 0;

  return {
    valid,
    count: links.length,
    summary: `sku-link-registry count=${links.length} coveredBrands=${covered.length} orphans=${orphanCount} valid=${valid}`,
  };
}
