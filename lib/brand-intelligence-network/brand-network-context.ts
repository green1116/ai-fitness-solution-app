import { getCatalogById } from "@/lib/product-catalog";
import {
  buildAuthorizationLinkRecords,
  getAuthorizationLinksByBrandId,
} from "./brand-mapping/authorization-link-registry";
import { buildBrandLinkRegistry } from "./brand-mapping/brand-link-registry";
import {
  buildSkuLinkRecords,
  getSkuLinksByBrandId,
  getSkuLinksBySku,
} from "./brand-mapping/sku-link-registry";
import {
  buildSupplierLinkRecords,
  getSupplierLinksByBrandId,
} from "./brand-mapping/supplier-link-registry";
import {
  buildBrandRegistryRecords,
  findBrandById,
  findBrandByNameOrAlias,
} from "./brand-registry";
import type {
  BrandMatchResult,
  BrandNetworkContext,
  BrandRecord,
  RegistryValidation,
} from "./shared/types";
import { TOP_BRAND_SCORE_THRESHOLD } from "./shared/types";

export function enrichBrandWithNetworkLinks(brand: BrandRecord): BrandRecord {
  return {
    ...brand,
    supplierLinkIds: getSupplierLinksByBrandId(brand.brandId).map((l) => l.linkId),
    skuLinkIds: getSkuLinksByBrandId(brand.brandId).map((l) => l.linkId),
    authorizationLinkIds: getAuthorizationLinksByBrandId(brand.brandId).map((l) => l.linkId),
  };
}

export function buildBrandNetworkContext(): BrandNetworkContext {
  const brands = buildBrandRegistryRecords().map(enrichBrandWithNetworkLinks);
  const supplierLinks = buildSupplierLinkRecords();
  const skuLinks = buildSkuLinkRecords();
  const authorizationLinks = buildAuthorizationLinkRecords();
  const brandLinks = buildBrandLinkRegistry();

  return {
    contextId: "brand-network-context-v38",
    brands,
    supplierLinks,
    skuLinks,
    authorizationLinks,
    brandLinks,
    linkCount: supplierLinks.length + skuLinks.length + authorizationLinks.length + brandLinks.length,
    networkReady: supplierLinks.length >= 4 && skuLinks.length >= 8,
    mode: "brand-intelligence-network",
  };
}

export function matchBrandToSupplier(brandId: string): BrandMatchResult {
  const brand = findBrandById(brandId);
  const links = getSupplierLinksByBrandId(brandId);
  return {
    matchId: `match-brand-supplier-${brandId}`,
    brandId,
    targetType: "supplier",
    targetId: links[0]?.supplierId ?? "none",
    matchScore: brand && links.length > 0 ? Math.min(100, 60 + links.length * 10) : 0,
    matchedLinkIds: links.map((l) => l.linkId),
    matchReady: links.length > 0,
    mode: "brand-intelligence-network",
  };
}

export function matchBrandToSku(brandId: string, sku?: string): BrandMatchResult {
  const links = sku ? getSkuLinksBySku(sku).filter((l) => l.brandId === brandId) : getSkuLinksByBrandId(brandId);
  return {
    matchId: `match-brand-sku-${brandId}-${sku ?? "all"}`,
    brandId,
    targetType: "sku",
    targetId: sku ?? links[0]?.sku ?? "none",
    matchScore: links.length > 0 ? Math.min(100, 55 + links.length * 8) : 0,
    matchedLinkIds: links.map((l) => l.linkId),
    matchReady: links.length > 0,
    mode: "brand-intelligence-network",
  };
}

export function matchBrandToCatalog(catalogId: string): BrandMatchResult[] {
  const catalog = getCatalogById(catalogId);
  if (!catalog) return [];

  const results: BrandMatchResult[] = [];
  for (const productId of catalog.productIds) {
    const skuLink = buildSkuLinkRecords().find((l) => l.productId === productId);
    if (!skuLink) continue;
    results.push(matchBrandToSku(skuLink.brandId, skuLink.sku));
  }

  if (results.length === 0) {
    const fallback = findBrandByNameOrAlias("Life Fitness");
    if (fallback) results.push(matchBrandToSupplier(fallback.brandId));
  }

  return results;
}

export function matchAuthorizedBrands(region: string): BrandRecord[] {
  const authLinks = buildAuthorizationLinkRecords().filter(
    (l) => l.region.toLowerCase() === region.toLowerCase() && l.authorizationStatus === "active",
  );
  const brandIds = [...new Set(authLinks.map((l) => l.brandId))];
  return brandIds
    .map((id) => enrichBrandWithNetworkLinks(findBrandById(id)!))
    .filter(Boolean);
}

export function findTopBrands(limit = 5): BrandRecord[] {
  return buildBrandRegistryRecords()
    .map(enrichBrandWithNetworkLinks)
    .filter((b) => b.score.totalBrandScore >= TOP_BRAND_SCORE_THRESHOLD)
    .sort((a, b) => b.score.totalBrandScore - a.score.totalBrandScore)
    .slice(0, limit);
}

export function validateBrandNetworkContext(): RegistryValidation {
  const context = buildBrandNetworkContext();
  const valid = context.networkReady && context.linkCount >= 12;

  return {
    valid,
    count: context.linkCount,
    summary: `brand-network-context links=${context.linkCount} networkReady=${context.networkReady} valid=${valid}`,
  };
}
