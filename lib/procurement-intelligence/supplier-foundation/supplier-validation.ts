import {
  buildSupplierCapabilityRegistry,
} from "./supplier-capability-registry";
import { buildSupplierRegistry } from "./supplier-registry";
import type { SupplierFoundationValidation } from "./supplier-types";

const PI_P1A_MIN_SUPPLIER_COUNT = 10;
const PI_P1A_MIN_CAPABILITY_COUNT = 20;

let cachedValidation: SupplierFoundationValidation | undefined;

export function validateSupplierFoundation(): SupplierFoundationValidation {
  if (cachedValidation) return cachedValidation;

  const supplierRegistry = buildSupplierRegistry();
  const capabilityRegistry = buildSupplierCapabilityRegistry();

  const supplierRegistryReady =
    supplierRegistry.count > 0 &&
    supplierRegistry.records.every(
      (record) =>
        record.id.length > 0 &&
        record.name.length > 0 &&
        record.capabilityTags.length > 0,
    );

  const capabilityRegistryReady =
    capabilityRegistry.count > 0 &&
    capabilityRegistry.records.every(
      (record) =>
        record.supplierId.length > 0 &&
        record.capabilityTag.length > 0 &&
        record.strengthScore >= 0 &&
        record.strengthScore <= 100,
    );

  const supplierCount = supplierRegistry.count;
  const capabilityCount = capabilityRegistry.count;

  const valid =
    supplierRegistryReady &&
    capabilityRegistryReady &&
    supplierCount >= PI_P1A_MIN_SUPPLIER_COUNT &&
    capabilityCount >= PI_P1A_MIN_CAPABILITY_COUNT;

  cachedValidation = {
    valid,
    supplierRegistryReady,
    capabilityRegistryReady,
    supplierCount,
    capabilityCount,
    summary: `supplier-foundation suppliers=${supplierCount} capabilities=${capabilityCount} valid=${valid}`,
  };

  return cachedValidation;
}
