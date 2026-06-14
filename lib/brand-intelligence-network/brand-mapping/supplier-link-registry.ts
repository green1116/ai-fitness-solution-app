import { getAllSuppliers } from "@/lib/regional-supplier-foundation";
import { buildBrandRegistryRecords, findBrandByNameOrAlias } from "../brand-registry";
import type { RegistryValidation, SupplierLink } from "../shared/types";

export function buildSupplierLinkRecords(): SupplierLink[] {
  const suppliers = getAllSuppliers();
  const links: SupplierLink[] = [];

  for (const supplier of suppliers) {
    const brand = findBrandByNameOrAlias(supplier.brand);
    if (!brand) continue;

    const orgMap: Record<string, string> = {
      "supplier-life-fitness-cn": "ind-org-supplier-life-fitness-cn",
      "supplier-technogym-cn": "ind-org-supplier-technogym-cn",
    };

    links.push({
      linkId: `supplier-link-${brand.brandId}-${supplier.id}`,
      brandId: brand.brandId,
      supplierId: supplier.id,
      organizationId: orgMap[supplier.id],
      region: supplier.region,
      linkStatus: supplier.status === "active" ? "active" : "archived",
      mode: "brand-intelligence-network",
    });
  }

  return links;
}

export function getSupplierLinksByBrandId(brandId: string): SupplierLink[] {
  return buildSupplierLinkRecords().filter((link) => link.brandId === brandId);
}

export function reverseTraceSupplierLink(linkId: string): SupplierLink | undefined {
  return buildSupplierLinkRecords().find((link) => link.linkId === linkId);
}

export function validateSupplierLinkRegistry(): RegistryValidation {
  const links = buildSupplierLinkRecords();
  const brands = buildBrandRegistryRecords().filter((b) =>
    ["brand-life-fitness", "brand-technogym", "brand-matrix", "brand-shuhua"].includes(b.brandId),
  );
  const covered = brands.filter((b) => links.some((l) => l.brandId === b.brandId));
  let orphanCount = 0;
  for (const link of links) {
    if (!buildBrandRegistryRecords().some((b) => b.brandId === link.brandId)) orphanCount += 1;
  }

  const valid = links.length >= 4 && covered.length >= 4 && orphanCount === 0;

  return {
    valid,
    count: links.length,
    summary: `supplier-link-registry count=${links.length} coveredBrands=${covered.length} orphans=${orphanCount} valid=${valid}`,
  };
}
