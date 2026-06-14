import { getV21SupplierEntries } from "@/lib/data-asset-loader";
import { getAllSuppliers } from "@/lib/regional-supplier-foundation/supplier-catalog";
import { getAllChannelPricing } from "@/lib/procurement-intelligence/channel-pricing";
import { getAllCoverageProfiles } from "../coverage-profile";
import { getAllInventoryProfiles } from "../inventory-profile";
import { getAllPricingProfiles } from "../pricing-profile";
import { getAllServiceProfiles } from "../service-profile";
import { getAllSupplierProfiles } from "../supplier-profile";
import type { SupplierPortalValidation } from "../shared/types";
import { CANONICAL_SUPPLIER_PORTAL_QUERY } from "../shared/types";

function validateV21NetworkCompatibility(): boolean {
  const v21Suppliers = getAllSuppliers();
  const portalSuppliers = getAllSupplierProfiles();
  const portalIds = new Set(portalSuppliers.map((s) => s.supplierId));
  return v21Suppliers.every((supplier) => portalIds.has(supplier.id));
}

function validateV22ProcurementCompatibility(): boolean {
  const v22Pricing = getAllChannelPricing();
  const portalPricing = getAllPricingProfiles();
  const portalSkus = new Set(portalPricing.map((p) => p.sku));
  return v22Pricing.every((entry) => portalSkus.has(entry.sku));
}

function validateDataSuppliersCompatibility(): boolean {
  const dataSuppliers = getV21SupplierEntries();
  const portalIds = new Set(getAllSupplierProfiles().map((s) => s.supplierId));
  return dataSuppliers.every((supplier) => portalIds.has(supplier.id));
}

export function validateSupplierPortal(): SupplierPortalValidation {
  const suppliers = getAllSupplierProfiles();
  const inventory = getAllInventoryProfiles();
  const pricing = getAllPricingProfiles();
  const services = getAllServiceProfiles();
  const coverage = getAllCoverageProfiles();
  const canonicalSupplier = suppliers.find(
    (s) => s.supplierId === CANONICAL_SUPPLIER_PORTAL_QUERY.supplierId,
  );

  const supplierExists =
    suppliers.length >= 10 &&
    suppliers.every(
      (s) =>
        s.supplierId.length > 0 &&
        s.supplierName.length > 0 &&
        s.status === "active" &&
        s.mode === "supplier-portal",
    ) &&
    canonicalSupplier !== undefined &&
    validateDataSuppliersCompatibility();

  const inventoryExists =
    inventory.length >= 10 &&
    inventory.every(
      (i) =>
        i.inventoryId.length > 0 &&
        i.sku.length > 0 &&
        i.warehouse.length > 0 &&
        i.quantity >= 0 &&
        i.mode === "supplier-portal",
    );

  const pricingExists =
    pricing.length >= 5 &&
    pricing.every(
      (p) =>
        p.listPrice > 0 &&
        p.dealerPrice > 0 &&
        p.projectPrice > 0 &&
        p.bulkPrice > 0 &&
        p.bulkPrice <= p.projectPrice &&
        p.mode === "supplier-portal",
    );

  const serviceExists =
    services.length >= 5 &&
    services.every(
      (s) =>
        s.city.length > 0 &&
        s.responseTime.length > 0 &&
        s.engineerCount > 0 &&
        s.mode === "supplier-portal",
    );

  const coverageExists =
    coverage.length >= 5 &&
    coverage.every(
      (c) =>
        c.city.length > 0 &&
        c.leadTime.length > 0 &&
        c.sla.length > 0 &&
        c.mode === "supplier-portal",
    );

  const v21NetworkCompatible = validateV21NetworkCompatibility();
  const v22ProcurementCompatible = validateV22ProcurementCompatibility();

  return {
    valid:
      supplierExists &&
      inventoryExists &&
      pricingExists &&
      serviceExists &&
      coverageExists &&
      v21NetworkCompatible &&
      v22ProcurementCompatible,
    supplierExists,
    inventoryExists,
    pricingExists,
    serviceExists,
    coverageExists,
    v21NetworkCompatible,
    v22ProcurementCompatible,
  };
}
