export const PLATFORM_FREEZE_BASELINE_VERSION = "phase-xiii-v1" as const;

export type FreezeDomainKey =
  | "runtime"
  | "consumer"
  | "dashboard"
  | "release"
  | "operations"
  | "commercialization"
  | "landing"
  | "governance"
  | "trust"
  | "control-center"
  | "executive"
  | "strategy";

export interface FreezeDomainEntry {
  domain: FreezeDomainKey;
  phase: number;
  phaseName: string;
  tag: string;
}

export interface FreezeInventory {
  inventoryId: string;
  version: typeof PLATFORM_FREEZE_BASELINE_VERSION;
  domains: FreezeDomainEntry[];
  totalPhases: number;
}
