import { PI_CANONICAL_ID } from "../shared/constants";
import type {
  SupplierAvailabilityRecord,
  SupplierPricingRecord,
  SupplierPricingSourceType,
} from "../shared/types";
import { buildSupplierRegistry } from "../supplier-foundation/supplier-registry";
import { collectPricingAvailabilityPairs } from "./pricing-availability-pairs";

export interface SupplierPricingRegistry {
  registryId: string;
  records: SupplierPricingRecord[];
  count: number;
  mode: typeof PI_CANONICAL_ID;
}

function resolveSourceType(source: string): SupplierPricingSourceType {
  if (source.includes("stub")) return "estimate";
  if (source.includes("brand")) return "real-catalog";
  return "catalog";
}

function estimatePriceRange(input: {
  supplierId: string;
  productId: string;
  reliabilityScore: number;
}): { priceLow: number; priceHigh: number; confidence: number } {
  const seed =
    input.supplierId.length * 17 +
    input.productId.length * 31 +
    input.reliabilityScore;
  const base = 45000 + (seed % 90000);
  const spread = Math.round((100 - input.reliabilityScore) * 150 + 5000);

  return {
    priceLow: Math.max(10000, base - spread),
    priceHigh: base + spread,
    confidence: Math.min(92, Math.max(45, input.reliabilityScore)),
  };
}

function collectSupplierProductPairs(): Array<{ supplierId: string; productId: string }> {
  return collectPricingAvailabilityPairs();
}

let cachedRegistry: SupplierPricingRegistry | undefined;

export function buildSupplierPricingRegistry(): SupplierPricingRegistry {
  if (cachedRegistry) return cachedRegistry;

  const suppliers = buildSupplierRegistry().records;
  const supplierById = new Map(suppliers.map((supplier) => [supplier.id, supplier]));
  const records: SupplierPricingRecord[] = [];

  for (const pair of collectSupplierProductPairs()) {
    const supplier = supplierById.get(pair.supplierId);
    if (!supplier) continue;

    const pricing = estimatePriceRange({
      supplierId: pair.supplierId,
      productId: pair.productId,
      reliabilityScore: supplier.reliabilityScore,
    });

    records.push({
      supplierId: pair.supplierId,
      productId: pair.productId,
      priceLow: pricing.priceLow,
      priceHigh: pricing.priceHigh,
      currency: "CNY",
      confidence: pricing.confidence,
      sourceType: resolveSourceType(supplier.source),
    });
  }

  cachedRegistry = {
    registryId: "pi-supplier-pricing-registry-v43-p1d",
    records,
    count: records.length,
    mode: PI_CANONICAL_ID,
  };

  return cachedRegistry;
}
