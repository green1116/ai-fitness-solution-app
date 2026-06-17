import { PI_CANONICAL_ID } from "../shared/constants";
import type {
  SupplierAvailabilityRecord,
  SupplierPricingRecord,
} from "../shared/types";
import type { SupplierRegistryRecord } from "../supplier-foundation/supplier-types";
import { buildSupplierRegistry } from "../supplier-foundation/supplier-registry";
import { buildSupplierAvailabilityRegistry } from "./supplier-availability-registry";
import { buildSupplierLeadTimeRegistry, type SupplierLeadTimeRecord } from "./supplier-leadtime-registry";
import { buildSupplierPricingRegistry } from "./supplier-pricing-registry";

export interface PricingAvailabilityContext {
  contextId: string;
  suppliers: SupplierRegistryRecord[];
  pricing: SupplierPricingRecord[];
  availability: SupplierAvailabilityRecord[];
  leadTime: SupplierLeadTimeRecord[];
  mode: typeof PI_CANONICAL_ID;
}

let cachedContext: PricingAvailabilityContext | undefined;

export function buildPricingAvailabilityContext(): PricingAvailabilityContext {
  if (cachedContext) return cachedContext;

  cachedContext = {
    contextId: "pi-pricing-availability-context-v43-p1d",
    suppliers: buildSupplierRegistry().records,
    pricing: buildSupplierPricingRegistry().records,
    availability: buildSupplierAvailabilityRegistry().records,
    leadTime: buildSupplierLeadTimeRegistry().records,
    mode: PI_CANONICAL_ID,
  };

  return cachedContext;
}
