import { PI_CANONICAL_ID } from "../shared/constants";
import type { SupplierAvailabilityRecord, SupplierAvailabilityStatus } from "../shared/types";
import { buildSupplierRegistry } from "../supplier-foundation/supplier-registry";
import { collectPricingAvailabilityPairs } from "./pricing-availability-pairs";

export interface SupplierAvailabilityRegistry {
  registryId: string;
  records: SupplierAvailabilityRecord[];
  count: number;
  mode: typeof PI_CANONICAL_ID;
}

function resolveAvailabilityConfidence(status: SupplierAvailabilityStatus): number {
  if (status === "in-stock") return 88;
  if (status === "limited") return 74;
  if (status === "backorder") return 62;
  return 40;
}

function resolveEtaDays(status: SupplierAvailabilityStatus): number | undefined {
  if (status === "in-stock") return 7;
  if (status === "limited") return 14;
  if (status === "backorder") return 35;
  return undefined;
}

function collectSupplierProductPairs(): Array<{ supplierId: string; productId: string }> {
  return collectPricingAvailabilityPairs();
}

let cachedRegistry: SupplierAvailabilityRegistry | undefined;

export function buildSupplierAvailabilityRegistry(): SupplierAvailabilityRegistry {
  if (cachedRegistry) return cachedRegistry;

  const suppliers = buildSupplierRegistry().records;
  const supplierById = new Map(suppliers.map((supplier) => [supplier.id, supplier]));
  const records: SupplierAvailabilityRecord[] = [];

  for (const pair of collectSupplierProductPairs()) {
    const supplier = supplierById.get(pair.supplierId);
    if (!supplier) continue;

    const availabilityStatus = supplier.availabilityStatus;

    records.push({
      supplierId: pair.supplierId,
      productId: pair.productId,
      availabilityStatus,
      etaDays: resolveEtaDays(availabilityStatus),
      confidence: resolveAvailabilityConfidence(availabilityStatus),
    });
  }

  cachedRegistry = {
    registryId: "pi-supplier-availability-registry-v43-p1d",
    records,
    count: records.length,
    mode: PI_CANONICAL_ID,
  };

  return cachedRegistry;
}
