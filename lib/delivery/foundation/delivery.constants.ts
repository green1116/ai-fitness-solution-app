/**
 * PI-6.1 — Delivery Readiness Foundation constants (PD-7).
 * Registry only — reuses FE / BE / Data / Integration / M11–M15; invents no architecture.
 */
export const DELIVERY_FOUNDATION_ID =
  "product-delivery-foundation-v1" as const;

export const DELIVERY_FOUNDATION_GATE =
  "product-delivery-foundation-gate" as const;

/** Existing PD-7.8 readiness baseline — not a new architecture. */
export const DELIVERY_READINESS_ID =
  "product-delivery-readiness-baseline-v1" as const;

export const DELIVERY_READINESS_GATE =
  "product-delivery-readiness-baseline-gate" as const;

export const DELIVERY_BASELINE_REF =
  "product-delivery-readiness-baseline-v1" as const;

export const DELIVERY_FREEZE_REF = "product-delivery-freeze-1" as const;

export const PI61_PACKAGE_ID = "PI-6.1" as const;

/** Frozen upstream baselines / freezes (string refs only — no module coupling). */
export const UI_BASELINE_REF = "product-ui-baseline-v1" as const;

export const FE_BASELINE_REF =
  "product-frontend-architecture-baseline-v1" as const;

export const BE_BASELINE_REF =
  "product-backend-architecture-baseline-v1" as const;

export const DATA_FOUNDATION_REF = "product-data-foundation-v1" as const;

export const INTEGRATION_BASELINE_REF =
  "product-integration-baseline-v1" as const;

export const INTEGRATION_FOUNDATION_REF =
  "product-integration-foundation-v1" as const;

export const PI2_FREEZE_REF = "pi-2-frontend-implementation-v1" as const;

export const PI3_FREEZE_REF = "pi-3-backend-implementation-v1" as const;

export const PI4_FREEZE_REF = "pi-4-data-implementation-v1" as const;

export const PI5_FREEZE_REF = "pi-5-integration-implementation-v1" as const;
