/**
 * PI-4.1 — Data Foundation constants (PD-5.4).
 * Registry only — reuses M11–M15 and existing storage; invents no Domains/families.
 */
export const DATA_FOUNDATION_ID = "product-data-foundation-v1" as const;

export const DATA_FOUNDATION_GATE = "product-data-foundation-gate" as const;

export const PERSISTENCE_ARCHITECTURE_ID =
  "product-backend-persistence-architecture-v1" as const;

export const PERSISTENCE_ARCHITECTURE_GATE =
  "product-backend-persistence-architecture-gate" as const;

export const PI41_PACKAGE_ID = "PI-4.1" as const;

/** PD-5.4 — L1 persistence position (reference; not a new architecture layer). */
export const DATA_LAYER_ID = "L1-PERSISTENCE-PORTS" as const;

export const BACKEND_ARCHITECTURE_BASELINE_REF =
  "product-backend-architecture-baseline-v1" as const;

export const PI3_FREEZE_REF = "pi-3-backend-implementation-v1" as const;
