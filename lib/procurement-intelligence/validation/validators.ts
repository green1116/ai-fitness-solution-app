import { buildCommercialBundle } from "../bridge/commercial-bridge";
import { buildProcurementBundle } from "../bridge/procurement-bridge";
import { getAllChannelPricing } from "../channel-pricing";
import { getAllDiscountRules } from "../discount-rules";
import { getAllLeadTimeIntelligence } from "../lead-time-intelligence";
import { getAllProjectPricing } from "../project-pricing";
import type { ProjectType } from "../shared/types";

export function validateChannelPricingCatalog(): {
  valid: boolean;
  count: number;
  uniqueSkus: number;
} {
  const entries = getAllChannelPricing();
  const uniqueSkus = new Set(entries.map((e) => e.sku)).size;
  const valid =
    entries.length >= 4 &&
    uniqueSkus >= 3 &&
    entries.every(
      (e) =>
        e.listPrice > 0 &&
        e.dealerPrice > 0 &&
        e.projectPrice > 0 &&
        e.bulkPrice > 0 &&
        e.status === "active",
    );
  return { valid, count: entries.length, uniqueSkus };
}

export function validateProjectPricingCatalog(): {
  valid: boolean;
  count: number;
  uniqueSkus: number;
} {
  const entries = getAllProjectPricing();
  const uniqueSkus = new Set(entries.map((e) => e.sku)).size;
  const valid =
    entries.length >= 4 &&
    uniqueSkus >= 3 &&
    entries.every(
      (e) =>
        e.basePrice > 0 &&
        e.discountRate >= 0 &&
        e.finalPrice > 0 &&
        e.finalPrice <= e.basePrice &&
        e.status === "active",
    );
  return { valid, count: entries.length, uniqueSkus };
}

export function validateDiscountRulesCatalog(): {
  valid: boolean;
  count: number;
  uniqueSkus: number;
} {
  const entries = getAllDiscountRules();
  const uniqueSkus = new Set(entries.map((e) => e.sku)).size;
  const valid =
    entries.length >= 4 &&
    uniqueSkus >= 3 &&
    entries.every(
      (e) =>
        e.quantityThreshold > 0 &&
        e.discountValue > 0 &&
        e.ruleName.length > 0 &&
        e.status === "active",
    );
  return { valid, count: entries.length, uniqueSkus };
}

export function validateLeadTimeIntelligenceCatalog(): {
  valid: boolean;
  count: number;
  uniqueSkus: number;
} {
  const entries = getAllLeadTimeIntelligence();
  const uniqueSkus = new Set(entries.map((e) => e.sku)).size;
  const valid =
    entries.length >= 4 &&
    uniqueSkus >= 3 &&
    entries.every(
      (e) =>
        e.leadTimeDays > 0 &&
        e.region.length > 0 &&
        e.status === "active",
    );
  return { valid, count: entries.length, uniqueSkus };
}

export function validateProcurementIntelligencePhase1(): {
  valid: boolean;
  channelPricing: ReturnType<typeof validateChannelPricingCatalog>;
  projectPricing: ReturnType<typeof validateProjectPricingCatalog>;
  discountRules: ReturnType<typeof validateDiscountRulesCatalog>;
  leadTime: ReturnType<typeof validateLeadTimeIntelligenceCatalog>;
} {
  const channelPricing = validateChannelPricingCatalog();
  const projectPricing = validateProjectPricingCatalog();
  const discountRules = validateDiscountRulesCatalog();
  const leadTime = validateLeadTimeIntelligenceCatalog();
  return {
    valid:
      channelPricing.valid &&
      projectPricing.valid &&
      discountRules.valid &&
      leadTime.valid,
    channelPricing,
    projectPricing,
    discountRules,
    leadTime,
  };
}

export function validateProcurementBundle(input: {
  sku: string;
  region: string;
  projectType: ProjectType;
  quantity: number;
}): {
  valid: boolean;
  skuExists: boolean;
  pricingExists: boolean;
  leadTimeExists: boolean;
  discountCalculable: boolean;
} {
  const channelPricing = getAllChannelPricing();
  const projectPricing = getAllProjectPricing();
  const leadTime = getAllLeadTimeIntelligence();
  const discountRules = getAllDiscountRules();

  const skuExists =
    channelPricing.some((e) => e.sku === input.sku) ||
    projectPricing.some((e) => e.sku === input.sku);

  const pricingExists =
    channelPricing.some((e) => e.sku === input.sku) &&
    projectPricing.some((e) => e.sku === input.sku && e.projectType === input.projectType);

  const leadTimeExists = leadTime.some(
    (e) => e.sku === input.sku && e.region === input.region,
  );

  const skuRules = discountRules.filter((r) => r.sku === input.sku);
  const bundle = buildProcurementBundle(input);

  const discountCalculable =
    skuRules.length > 0 &&
    (skuRules.some((r) => input.quantity >= r.quantityThreshold) ||
      bundle.projectPricing !== undefined);

  const valid =
    skuExists &&
    pricingExists &&
    leadTimeExists &&
    discountCalculable &&
    bundle.finalPrice > 0 &&
    bundle.savings >= 0;

  return {
    valid,
    skuExists,
    pricingExists,
    leadTimeExists,
    discountCalculable,
  };
}

export function validateCommercialBundle(input: {
  sku: string;
  city: string;
  quantity: number;
  projectType: ProjectType;
}): {
  valid: boolean;
  catalogExists: boolean;
  supplierExists: boolean;
  inventoryExists: boolean;
  serviceExists: boolean;
  pricingExists: boolean;
} {
  const bundle = buildCommercialBundle(input);

  const catalogExists = bundle.catalog !== null;
  const supplierExists = bundle.supplierNetwork.supplier.length > 0;
  const inventoryExists = bundle.supplierNetwork.inventory.length > 0;
  const serviceExists = bundle.supplierNetwork.service.length > 0;
  const pricingExists =
    bundle.catalog?.pricing !== undefined && bundle.procurement.finalPrice > 0;

  const valid =
    catalogExists &&
    supplierExists &&
    inventoryExists &&
    serviceExists &&
    pricingExists &&
    bundle.readinessScore > 0;

  return {
    valid,
    catalogExists,
    supplierExists,
    inventoryExists,
    serviceExists,
    pricingExists,
  };
}
