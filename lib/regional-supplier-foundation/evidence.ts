import { buildSupplierNetworkBundle } from "./bridge/supplier-bridge";
import { getAllCoverage } from "./coverage-catalog";
import { getAllDealers } from "./dealer-catalog";
import { getAllInventory } from "./inventory-catalog";
import { getAllServices } from "./service-catalog";
import type { SupplierNetworkEvidence } from "./shared/types";
import { REGIONAL_SUPPLIER_FOUNDATION_VERSION } from "./shared/types";
import { getAllSuppliers } from "./supplier-catalog";
import { validateSupplierNetworkBundle } from "./validation/validators";

const SAMPLE_BUNDLE_QUERIES = [
  { brand: "Life Fitness", city: "Shanghai", sku: "LF-T5-001" },
  { brand: "Technogym", city: "Shanghai", sku: "TG-SKILLRUN-001" },
  { brand: "Shuhua", city: "Chengdu", sku: "SH-T8000-001" },
] as const;

export function buildSupplierNetworkEvidence(): SupplierNetworkEvidence {
  const suppliers = getAllSuppliers();
  const dealers = getAllDealers();
  const coverage = getAllCoverage();
  const inventory = getAllInventory();
  const services = getAllServices();

  const bundleResults = SAMPLE_BUNDLE_QUERIES.map((q) => validateSupplierNetworkBundle(q));
  const bundleValidationPassed = bundleResults.every((r) => r.valid);

  if (!bundleValidationPassed) {
    const failed = SAMPLE_BUNDLE_QUERIES.filter(
      (_, i) => !bundleResults[i].valid,
    ).map((q) => `${q.brand}/${q.city}/${q.sku}`);
    throw new Error(`Supplier network evidence incomplete: ${failed.join(", ")}`);
  }

  for (const query of SAMPLE_BUNDLE_QUERIES) {
    buildSupplierNetworkBundle(query);
  }

  return {
    evidenceId: `evidence-supplier-network-${Date.now()}`,
    version: REGIONAL_SUPPLIER_FOUNDATION_VERSION,
    supplierCount: suppliers.length,
    dealerCount: dealers.length,
    coverageCount: coverage.length,
    inventoryCount: inventory.length,
    serviceCount: services.length,
    bundleValidationPassed,
    generatedAt: new Date().toISOString(),
    summary: `supplier-network-evidence suppliers=${suppliers.length} dealers=${dealers.length} coverage=${coverage.length} inventory=${inventory.length} service=${services.length} bundles=${SAMPLE_BUNDLE_QUERIES.length}`,
  };
}
