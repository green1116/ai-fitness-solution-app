/**
 * PI-5.1 — Closed inventory refs consumed by integration (PD-6.1 §1.3).
 * Counts lock frozen FE / BE / Data inventories — no new architecture.
 */
export const INTEGRATION_INVENTORY_REFS = {
  screens: 9,
  productCmp: 26,
  interactions: 25,
  commands: 47,
  apiFamilies: 11,
  services: 8,
  domains: 5,
  repositories: 9,
  storageFamilies: 7,
  pipelineStages: 5,
  bindingKinds: 5,
} as const;

/** Evidence script / freeze tags that must remain present. */
export const INTEGRATION_UPSTREAM_EVIDENCE = [
  "scripts/verify-pi-2.ts",
  "scripts/verify-pi-3.ts",
  "scripts/verify-pi-4.ts",
  "lib/backend/foundation/index.ts",
  "lib/data/foundation/index.ts",
  "lib/frontend/adapter-bindings.ts",
] as const;
