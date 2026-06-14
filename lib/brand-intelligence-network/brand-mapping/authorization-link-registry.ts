import { getAllSuppliers } from "@/lib/regional-supplier-foundation";
import { findBrandById, findBrandByNameOrAlias } from "../brand-registry";
import type { AuthorizationLevel, AuthorizationLink, RegistryValidation } from "../shared/types";

export function buildAuthorizationLinkRecords(): AuthorizationLink[] {
  const suppliers = getAllSuppliers();
  const links: AuthorizationLink[] = [];

  for (const supplier of suppliers) {
    const brand = findBrandByNameOrAlias(supplier.brand);
    if (!brand) continue;

    links.push({
      linkId: `auth-link-${brand.brandId}-${supplier.id}`,
      brandId: brand.brandId,
      supplierId: supplier.id,
      authorizationLevel: supplier.authorizationLevel as AuthorizationLevel,
      authorizationStatus: supplier.status === "active" ? "active" : "revoked",
      region: supplier.region,
      mode: "brand-intelligence-network",
    });
  }

  return links;
}

export function getAuthorizationLinksByBrandId(brandId: string): AuthorizationLink[] {
  return buildAuthorizationLinkRecords().filter((link) => link.brandId === brandId);
}

export function reverseTraceAuthorizationLink(linkId: string): AuthorizationLink | undefined {
  return buildAuthorizationLinkRecords().find((link) => link.linkId === linkId);
}

export function validateAuthorizationLinkRegistry(): RegistryValidation {
  const links = buildAuthorizationLinkRecords();
  const levels = new Set(links.map((l) => l.authorizationLevel));
  let orphanCount = 0;
  for (const link of links) {
    if (!findBrandById(link.brandId)) orphanCount += 1;
  }

  const valid = links.length >= 4 && levels.size >= 2 && orphanCount === 0;

  return {
    valid,
    count: links.length,
    summary: `authorization-link-registry count=${links.length} levels=${levels.size} orphans=${orphanCount} valid=${valid}`,
  };
}
