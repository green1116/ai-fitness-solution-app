import { PI_CANONICAL_ID } from "../shared/constants";
import type { SupplierAvailabilityStatus } from "../shared/types";
import { buildSupplierRegistry } from "../supplier-foundation/supplier-registry";
import { collectPricingAvailabilityPairs } from "./pricing-availability-pairs";

export interface SupplierLeadTimeRecord {
  supplierId: string;
  productId: string;
  leadTimeDays: number;
  confidence: number;
}

export interface SupplierLeadTimeRegistry {
  registryId: string;
  records: SupplierLeadTimeRecord[];
  count: number;
  mode: typeof PI_CANONICAL_ID;
}

function resolveLeadTimeDays(
  availabilityStatus: SupplierAvailabilityStatus,
  reliabilityScore: number,
): { leadTimeDays: number; confidence: number } {
  const baseByStatus: Record<SupplierAvailabilityStatus, number> = {
    "in-stock": 10,
    limited: 18,
    backorder: 42,
    unavailable: 60,
  };

  const adjustment = Math.round((100 - reliabilityScore) / 10);
  const leadTimeDays = baseByStatus[availabilityStatus] + adjustment;
  const confidence = Math.min(90, Math.max(50, reliabilityScore - adjustment));

  return { leadTimeDays, confidence };
}

function collectSupplierProductPairs(): Array<{ supplierId: string; productId: string }> {
  return collectPricingAvailabilityPairs();
}

let cachedRegistry: SupplierLeadTimeRegistry | undefined;

export function buildSupplierLeadTimeRegistry(): SupplierLeadTimeRegistry {
  if (cachedRegistry) return cachedRegistry;

  const suppliers = buildSupplierRegistry().records;
  const supplierById = new Map(suppliers.map((supplier) => [supplier.id, supplier]));
  const records: SupplierLeadTimeRecord[] = [];

  for (const pair of collectSupplierProductPairs()) {
    const supplier = supplierById.get(pair.supplierId);
    if (!supplier) continue;

    const leadTime = resolveLeadTimeDays(supplier.availabilityStatus, supplier.reliabilityScore);

    records.push({
      supplierId: pair.supplierId,
      productId: pair.productId,
      leadTimeDays: leadTime.leadTimeDays,
      confidence: leadTime.confidence,
    });
  }

  cachedRegistry = {
    registryId: "pi-supplier-leadtime-registry-v43-p1d",
    records,
    count: records.length,
    mode: PI_CANONICAL_ID,
  };

  return cachedRegistry;
}
