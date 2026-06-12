import { getCoverageByCity } from "../coverage-catalog";
import { getDealersByCity } from "../dealer-catalog";
import { getInventoryBySku } from "../inventory-catalog";
import { getServicesByCity } from "../service-catalog";
import type { SupplierNetworkBundle } from "../shared/types";
import { getSuppliersByBrand } from "../supplier-catalog";

export function buildRegionalSupplySnapshot(input: { brand: string; city: string }) {
  return {
    suppliers: getSuppliersByBrand(input.brand),
    dealers: getDealersByCity(input.city),
    coverage: getCoverageByCity(input.city),
  };
}

export function buildSupplierNetworkBundle(input: {
  brand: string;
  city: string;
  sku: string;
}): SupplierNetworkBundle {
  const { brand, city, sku } = input;

  const supplier = getSuppliersByBrand(brand);
  const dealer = getDealersByCity(city);
  const coverage = getCoverageByCity(city);
  const inventory = getInventoryBySku(sku);
  const service = getServicesByCity(city);

  const checks = [
    supplier.length > 0,
    dealer.length > 0,
    coverage !== undefined,
    inventory.length > 0,
    service.length > 0,
  ];
  const bundleReadiness = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  return {
    bundleId: `network-bundle-${brand}-${city}-${sku}`.replace(/\s+/g, "-").toLowerCase(),
    brand,
    city,
    sku,
    supplier,
    dealer,
    coverage,
    inventory,
    service,
    bundleReadiness,
  };
}
