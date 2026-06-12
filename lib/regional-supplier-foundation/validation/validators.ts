import { buildSupplierNetworkBundle } from "../bridge/supplier-bridge";
import { getAllCoverage } from "../coverage-catalog";
import { getAllDealers } from "../dealer-catalog";
import { getAllInventory } from "../inventory-catalog";
import { getAllServices } from "../service-catalog";
import { getAllSuppliers } from "../supplier-catalog";

export function validateSupplierFoundationPhase1(): {
  valid: boolean;
  supplierCount: number;
  dealerCount: number;
  coverageCount: number;
} {
  const suppliers = getAllSuppliers();
  const dealers = getAllDealers();
  const coverage = getAllCoverage();
  const valid =
    suppliers.length >= 3 &&
    dealers.length >= 3 &&
    coverage.length >= 3 &&
    suppliers.every((s) => s.status === "active" && s.contact.length > 0);
  return {
    valid,
    supplierCount: suppliers.length,
    dealerCount: dealers.length,
    coverageCount: coverage.length,
  };
}

export function validateInventoryCatalog(): {
  valid: boolean;
  count: number;
  uniqueSkus: number;
  inStockRate: number;
} {
  const inventory = getAllInventory();
  const uniqueSkus = new Set(inventory.map((i) => i.sku)).size;
  const inStock = inventory.filter((i) => i.stockStatus === "in-stock").length;
  const valid =
    inventory.length >= 5 &&
    uniqueSkus >= 4 &&
    inventory.every(
      (i) =>
        i.sku.length > 0 &&
        i.warehouseLocation.length > 0 &&
        i.availableQuantity >= 0 &&
        i.safetyStock > 0,
    );
  return {
    valid,
    count: inventory.length,
    uniqueSkus,
    inStockRate: Math.round((inStock / inventory.length) * 100),
  };
}

export function validateServiceCatalog(): {
  valid: boolean;
  count: number;
  activeCount: number;
  citiesCovered: number;
} {
  const services = getAllServices();
  const cities = new Set(services.map((s) => s.city));
  const activeCount = services.filter((s) => s.status === "active").length;
  const valid =
    services.length >= 4 &&
    activeCount >= 4 &&
    services.every(
      (s) =>
        s.serviceProvider.length > 0 &&
        s.engineerCount > 0 &&
        s.responseTime.length > 0 &&
        s.sla.length > 0,
    );
  return {
    valid,
    count: services.length,
    activeCount,
    citiesCovered: cities.size,
  };
}

export function validateSupplierFoundationPhase2(): {
  valid: boolean;
  phase1: ReturnType<typeof validateSupplierFoundationPhase1>;
  inventory: ReturnType<typeof validateInventoryCatalog>;
  service: ReturnType<typeof validateServiceCatalog>;
} {
  const phase1 = validateSupplierFoundationPhase1();
  const inventory = validateInventoryCatalog();
  const service = validateServiceCatalog();
  return {
    valid: phase1.valid && inventory.valid && service.valid,
    phase1,
    inventory,
    service,
  };
}

export function validateSupplierNetworkBundle(input: {
  brand: string;
  city: string;
  sku: string;
}): {
  valid: boolean;
  brandExists: boolean;
  cityExists: boolean;
  skuExists: boolean;
  inventoryMatched: boolean;
  serviceMatched: boolean;
} {
  const suppliers = getAllSuppliers();
  const coverage = getAllCoverage();
  const inventory = getAllInventory();
  const services = getAllServices();

  const brandExists = suppliers.some((s) => s.brand === input.brand);
  const cityExists = coverage.some((c) => c.city === input.city);
  const skuExists = inventory.some((i) => i.sku === input.sku);

  const bundle = buildSupplierNetworkBundle(input);
  const inventoryMatched = bundle.inventory.length > 0 && bundle.inventory.every((i) => i.sku === input.sku);
  const serviceMatched = bundle.service.length > 0 && bundle.service.some((s) => s.city === input.city);

  const valid = brandExists && cityExists && skuExists && inventoryMatched && serviceMatched;

  return {
    valid,
    brandExists,
    cityExists,
    skuExists,
    inventoryMatched,
    serviceMatched,
  };
}
