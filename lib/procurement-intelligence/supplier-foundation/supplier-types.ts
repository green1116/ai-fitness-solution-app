import type { PI_CANONICAL_ID } from "../shared/constants";
import type { SupplierCapabilityRecord, SupplierRecord } from "../shared/types";

export interface SupplierRegistryRecord extends SupplierRecord {}

export interface SupplierRegistry {
  registryId: string;
  records: SupplierRegistryRecord[];
  count: number;
  mode: typeof PI_CANONICAL_ID;
}

export interface SupplierCapabilityRegistry {
  registryId: string;
  records: SupplierCapabilityRecord[];
  count: number;
  mode: typeof PI_CANONICAL_ID;
}

export interface SupplierFoundationValidation {
  valid: boolean;
  supplierRegistryReady: boolean;
  capabilityRegistryReady: boolean;
  supplierCount: number;
  capabilityCount: number;
  summary: string;
}
