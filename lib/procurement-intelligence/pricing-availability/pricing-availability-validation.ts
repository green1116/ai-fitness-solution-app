import { buildSupplierRegistry } from "../supplier-foundation/supplier-registry";
import { buildProcurementMatches } from "../procurement-matching/procurement-match-builder";
import { buildPricingAvailabilityContext } from "./pricing-availability-context";
import { buildSupplierAvailabilityRegistry } from "./supplier-availability-registry";
import { buildSupplierLeadTimeRegistry } from "./supplier-leadtime-registry";
import { buildSupplierPricingRegistry } from "./supplier-pricing-registry";

const PI_P1D_MIN_PRICING_COUNT = 10;
const PI_P1D_MIN_AVAILABILITY_COUNT = 10;
const PI_P1D_MIN_LEADTIME_COUNT = 10;

export interface PricingAvailabilityValidation {
  valid: boolean;
  pricingReady: boolean;
  availabilityReady: boolean;
  leadTimeReady: boolean;
  supplierCoverageReady: boolean;
  pricingCount: number;
  availabilityCount: number;
  leadTimeCount: number;
  coveredSupplierCount: number;
  summary: string;
}

let cachedValidation: PricingAvailabilityValidation | undefined;

export function validatePricingAvailability(): PricingAvailabilityValidation {
  if (cachedValidation) return cachedValidation;

  const context = buildPricingAvailabilityContext();
  const pricing = buildSupplierPricingRegistry();
  const availability = buildSupplierAvailabilityRegistry();
  const leadTime = buildSupplierLeadTimeRegistry();

  const pricingReady =
    pricing.count > 0 &&
    pricing.records.every(
      (record) =>
        record.supplierId.length > 0 &&
        Boolean(record.productId) &&
        record.priceLow > 0 &&
        record.priceHigh >= record.priceLow &&
        record.currency.length > 0 &&
        record.confidence >= 0,
    );

  const availabilityReady =
    availability.count > 0 &&
    availability.records.every(
      (record) =>
        record.supplierId.length > 0 &&
        Boolean(record.productId) &&
        record.confidence >= 0,
    );

  const leadTimeReady =
    leadTime.count > 0 &&
    leadTime.records.every(
      (record) =>
        record.supplierId.length > 0 &&
        record.productId.length > 0 &&
        record.leadTimeDays > 0 &&
        record.confidence >= 0,
    );

  const matchedSupplierIds = new Set(
    buildProcurementMatches().map((match) => match.supplierId),
  );
  const pricedSupplierIds = new Set(pricing.records.map((record) => record.supplierId));
  const coveredSupplierCount = [...matchedSupplierIds].filter((supplierId) =>
    pricedSupplierIds.has(supplierId),
  ).length;

  const supplierCoverageReady =
    matchedSupplierIds.size > 0 &&
    coveredSupplierCount === matchedSupplierIds.size;

  const pricingCount = pricing.count;
  const availabilityCount = availability.count;
  const leadTimeCount = leadTime.count;

  const valid =
    pricingReady &&
    availabilityReady &&
    leadTimeReady &&
    supplierCoverageReady &&
    pricingCount >= PI_P1D_MIN_PRICING_COUNT &&
    availabilityCount >= PI_P1D_MIN_AVAILABILITY_COUNT &&
    leadTimeCount >= PI_P1D_MIN_LEADTIME_COUNT;

  cachedValidation = {
    valid,
    pricingReady,
    availabilityReady,
    leadTimeReady,
    supplierCoverageReady,
    pricingCount,
    availabilityCount,
    leadTimeCount,
    coveredSupplierCount,
    summary: `pricing-availability pricing=${pricingCount} availability=${availabilityCount} leadTime=${leadTimeCount} coveredSuppliers=${coveredSupplierCount}/${matchedSupplierIds.size} valid=${valid}`,
  };

  return cachedValidation;
}

export function getPricingAvailabilityContextSummary(): string {
  const context = buildPricingAvailabilityContext();
  return `suppliers=${context.suppliers.length} pricing=${context.pricing.length} availability=${context.availability.length} leadTime=${context.leadTime.length}`;
}
