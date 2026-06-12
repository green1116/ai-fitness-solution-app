import { buildSupplierNetworkBundle } from "../bridge/supplier-bridge";
import { getAllCoverage } from "../coverage-catalog";
import { getAllDealers } from "../dealer-catalog";
import { getAllInventory } from "../inventory-catalog";
import { getAllServices } from "../service-catalog";
import { getAllSuppliers } from "../supplier-catalog";
import type {
  InventoryCoverageSummary,
  ServiceCoverageSummary,
  SupplierFoundationPhase1Report,
  SupplierFoundationPhase2Report,
  SupplierNetworkReport,
} from "../shared/types";
import { REGIONAL_SUPPLIER_FOUNDATION_VERSION } from "../shared/types";
import {
  validateInventoryCatalog,
  validateServiceCatalog,
  validateSupplierFoundationPhase1,
  validateSupplierFoundationPhase2,
  validateSupplierNetworkBundle,
} from "../validation/validators";

export function buildInventoryCoverageSummary(): InventoryCoverageSummary {
  const inventory = getAllInventory();
  const uniqueSkus = new Set(inventory.map((i) => i.sku));
  const inStockCount = inventory.filter((i) => i.stockStatus === "in-stock").length;
  const lowStockCount = inventory.filter((i) => i.stockStatus === "low-stock").length;
  const madeToOrderCount = inventory.filter((i) => i.stockStatus === "made-to-order").length;
  const warehouseLocations = [...new Set(inventory.map((i) => i.warehouseLocation))];

  return {
    totalSkus: uniqueSkus.size,
    inStockCount,
    lowStockCount,
    madeToOrderCount,
    warehouseLocations,
    coverageRate: Math.round((inStockCount / inventory.length) * 100),
  };
}

export function buildServiceCoverageSummary(): ServiceCoverageSummary {
  const services = getAllServices();
  const activeProviders = services.filter((s) => s.status === "active");
  const citiesCovered = [...new Set(services.map((s) => s.city))];
  const withSpareParts = services.filter((s) => s.sparePartsAvailable).length;
  const avgEngineerCount = Math.round(
    services.reduce((sum, s) => sum + s.engineerCount, 0) / services.length,
  );

  return {
    totalProviders: services.length,
    activeProviders: activeProviders.length,
    citiesCovered,
    avgEngineerCount,
    sparePartsCoverageRate: Math.round((withSpareParts / services.length) * 100),
  };
}

export function buildSupplierFoundationPhase1Report(): SupplierFoundationPhase1Report {
  const validation = validateSupplierFoundationPhase1();
  const suppliers = getAllSuppliers();
  const dealers = getAllDealers();
  const coverage = getAllCoverage();

  return {
    version: REGIONAL_SUPPLIER_FOUNDATION_VERSION,
    reportId: `supplier-foundation-phase1-report-${Date.now()}`,
    supplierCount: suppliers.length,
    dealerCount: dealers.length,
    coverageCount: coverage.length,
    summary: [
      "supplier-foundation-phase1-report",
      `valid=${validation.valid}`,
      `suppliers=${suppliers.length}`,
      `dealers=${dealers.length}`,
      `coverage=${coverage.length}`,
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}

export function buildSupplierFoundationPhase2Report(): SupplierFoundationPhase2Report {
  const validation = validateSupplierFoundationPhase2();
  const suppliers = getAllSuppliers();
  const dealers = getAllDealers();
  const coverage = getAllCoverage();
  const inventory = getAllInventory();
  const services = getAllServices();
  const inventoryCoverage = buildInventoryCoverageSummary();
  const serviceCoverage = buildServiceCoverageSummary();

  return {
    version: REGIONAL_SUPPLIER_FOUNDATION_VERSION,
    reportId: `supplier-foundation-phase2-report-${Date.now()}`,
    supplierCount: suppliers.length,
    dealerCount: dealers.length,
    coverageCount: coverage.length,
    inventoryCount: inventory.length,
    serviceCount: services.length,
    inventoryCoverage,
    serviceCoverage,
    validation: {
      phase1Valid: validation.phase1.valid,
      inventoryValid: validation.inventory.valid,
      serviceValid: validation.service.valid,
      overallValid: validation.valid,
    },
    summary: [
      "supplier-foundation-phase2-report",
      `overallValid=${validation.valid}`,
      `inventory=${inventory.length}`,
      `service=${services.length}`,
      `inventoryCoverage=${inventoryCoverage.coverageRate}%`,
      `serviceCities=${serviceCoverage.citiesCovered.length}`,
      `sparePartsCoverage=${serviceCoverage.sparePartsCoverageRate}%`,
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}

const EXAMPLE_BUNDLE_QUERY = {
  brand: "Life Fitness",
  city: "Shanghai",
  sku: "LF-T5-001",
} as const;

export function buildSupplierNetworkReport(): SupplierNetworkReport {
  const suppliers = getAllSuppliers();
  const dealers = getAllDealers();
  const coverage = getAllCoverage();
  const inventory = getAllInventory();
  const services = getAllServices();
  const bundleValidation = validateSupplierNetworkBundle(EXAMPLE_BUNDLE_QUERY);
  const exampleBundle = bundleValidation.valid
    ? buildSupplierNetworkBundle(EXAMPLE_BUNDLE_QUERY)
    : null;

  return {
    version: REGIONAL_SUPPLIER_FOUNDATION_VERSION,
    reportId: `supplier-network-report-${Date.now()}`,
    supplierCount: suppliers.length,
    dealerCount: dealers.length,
    coverageCount: coverage.length,
    inventoryCount: inventory.length,
    serviceCount: services.length,
    bundleValidation,
    exampleBundle,
    summary: [
      "supplier-network-report",
      `bundleValid=${bundleValidation.valid}`,
      `suppliers=${suppliers.length}`,
      `dealers=${dealers.length}`,
      `coverage=${coverage.length}`,
      `inventory=${inventory.length}`,
      `service=${services.length}`,
      exampleBundle ? `exampleReadiness=${exampleBundle.bundleReadiness}%` : "example=null",
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}
