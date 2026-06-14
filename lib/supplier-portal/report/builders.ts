import { getAllCoverageProfiles } from "../coverage-profile";
import { getAllInventoryProfiles } from "../inventory-profile";
import { getAllPricingProfiles } from "../pricing-profile";
import { getAllServiceProfiles } from "../service-profile";
import { getAllSupplierProfiles } from "../supplier-profile";
import type { SupplierPortalReport } from "../shared/types";
import {
  CANONICAL_SUPPLIER_PORTAL_QUERY,
  SUPPLIER_PORTAL_VERSION,
} from "../shared/types";
import { validateSupplierPortal } from "../validation/validators";

export function buildSupplierPortalReport(): SupplierPortalReport {
  const suppliers = getAllSupplierProfiles();
  const inventory = getAllInventoryProfiles();
  const pricing = getAllPricingProfiles();
  const services = getAllServiceProfiles();
  const coverage = getAllCoverageProfiles();
  const validation = validateSupplierPortal();

  return {
    version: SUPPLIER_PORTAL_VERSION,
    reportId: `supplier-portal-report-${Date.now()}`,
    supplierCount: suppliers.length,
    inventoryCount: inventory.length,
    pricingCount: pricing.length,
    serviceCount: services.length,
    coverageCount: coverage.length,
    validation,
    summary: [
      "supplier-portal-report",
      `suppliers=${suppliers.length}`,
      `inventory=${inventory.length}`,
      `pricing=${pricing.length}`,
      `services=${services.length}`,
      `coverage=${coverage.length}`,
      `valid=${validation.valid}`,
      `v21Compatible=${validation.v21NetworkCompatible}`,
      `v22Compatible=${validation.v22ProcurementCompatible}`,
      `canonical=${CANONICAL_SUPPLIER_PORTAL_QUERY.supplierId}`,
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}
