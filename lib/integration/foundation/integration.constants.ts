/**
 * PI-5.1 — Integration Foundation constants (PD-6.1).
 * Registry only — reuses frozen FE / BE / Data / Domain inventories.
 */
export const INTEGRATION_FOUNDATION_ID =
  "product-integration-foundation-v1" as const;

export const INTEGRATION_FOUNDATION_GATE =
  "product-integration-foundation-gate" as const;

export const INTEGRATION_ARCHITECTURE_ID =
  "product-integration-architecture-v1" as const;

export const INTEGRATION_ARCHITECTURE_GATE =
  "product-integration-architecture-gate" as const;

export const INTEGRATION_BASELINE_REF = "product-integration-baseline-v1" as const;

export const PI51_PACKAGE_ID = "PI-5.1" as const;

/** Frozen upstream baselines (string refs only — no module coupling). */
export const FE_BASELINE_REF =
  "product-frontend-architecture-baseline-v1" as const;

export const BE_BASELINE_REF =
  "product-backend-architecture-baseline-v1" as const;

export const DATA_FOUNDATION_REF = "product-data-foundation-v1" as const;

export const UI_BASELINE_REF = "product-ui-baseline-v1" as const;

export const PI3_FREEZE_REF = "pi-3-backend-implementation-v1" as const;

export const PI4_FREEZE_REF = "pi-4-data-implementation-v1" as const;
