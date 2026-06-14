import { buildBrandRegistryRecords, findBrandById } from "../brand-registry";
import { findManufacturerByBrandId } from "../manufacturer-registry";
import type { BrandLink, LinkStatus } from "../shared/types";

export function buildBrandManufacturerLinks(): BrandLink[] {
  const brands = buildBrandRegistryRecords();

  return brands.map((brand) => ({
    linkId: `brand-link-${brand.brandId}-manufacturer-${brand.manufacturerId}`,
    brandId: brand.brandId,
    targetType: "manufacturer" as const,
    targetId: brand.manufacturerId,
    linkStatus: "active" as LinkStatus,
    mode: "brand-intelligence-network" as const,
  }));
}

export function buildBrandLinkRegistry(): BrandLink[] {
  return buildBrandManufacturerLinks();
}

export function getBrandLinksByBrandId(brandId: string): BrandLink[] {
  return buildBrandLinkRegistry().filter((link) => link.brandId === brandId);
}

export function reverseTraceBrandLink(linkId: string): BrandLink | undefined {
  return buildBrandLinkRegistry().find((link) => link.linkId === linkId);
}

export function validateBrandLinkRegistry(): { valid: boolean; orphanCount: number; summary: string } {
  const links = buildBrandLinkRegistry();
  let orphanCount = 0;

  for (const link of links) {
    const brand = findBrandById(link.brandId);
    const manufacturer =
      link.targetType === "manufacturer" ? findManufacturerByBrandId(link.brandId) : undefined;
    if (!brand || (link.targetType === "manufacturer" && !manufacturer)) {
      orphanCount += 1;
    }
  }

  const valid = links.length >= 8 && orphanCount === 0;
  return {
    valid,
    orphanCount,
    summary: `brand-link-registry count=${links.length} orphans=${orphanCount} valid=${valid}`,
  };
}
