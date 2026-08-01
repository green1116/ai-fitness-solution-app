/**
 * PI-8.1 — Product Closure Foundation constants (PD-7 / PI-7).
 * Registry only — reuses FE / BE / Data / Integration / Delivery /
 * Implementation / M11–M15; invents no architecture.
 */
export const CLOSURE_FOUNDATION_ID =
  "product-closure-foundation-v1" as const;

export const CLOSURE_FOUNDATION_GATE =
  "product-closure-foundation-gate" as const;

/** Closure baseline over existing PI stack — not a new architecture. */
export const CLOSURE_BASELINE_ID = "product-closure-baseline-v1" as const;

export const CLOSURE_BASELINE_GATE = "product-closure-baseline-gate" as const;

export const CLOSURE_BASELINE_REF = "product-closure-baseline-v1" as const;

export const PI81_PACKAGE_ID = "PI-8.1" as const;

/** Frozen upstream baselines (string refs only — no module coupling). */
export const UI_BASELINE_REF = "product-ui-baseline-v1" as const;

export const FE_BASELINE_REF =
  "product-frontend-architecture-baseline-v1" as const;

export const BE_BASELINE_REF =
  "product-backend-architecture-baseline-v1" as const;

export const DATA_FOUNDATION_REF = "product-data-foundation-v1" as const;

export const INTEGRATION_BASELINE_REF =
  "product-integration-baseline-v1" as const;

export const DELIVERY_READINESS_REF =
  "product-delivery-readiness-baseline-v1" as const;

export const DELIVERY_FOUNDATION_REF =
  "product-delivery-foundation-v1" as const;

export const IMPLEMENTATION_FOUNDATION_REF =
  "product-implementation-foundation-v1" as const;

export const IMPLEMENTATION_BASELINE_REF =
  "product-implementation-baseline-v1" as const;

export const IMPLEMENTATION_FREEZE_REF =
  "product-implementation-freeze-1" as const;

export const DELIVERY_FREEZE_REF = "product-delivery-freeze-1" as const;

export const PI2_FREEZE_REF = "pi-2-frontend-implementation-v1" as const;

export const PI3_FREEZE_REF = "pi-3-backend-implementation-v1" as const;

export const PI4_FREEZE_REF = "pi-4-data-implementation-v1" as const;

export const PI5_FREEZE_REF = "pi-5-integration-implementation-v1" as const;

export const PI6_FREEZE_REF = "pi-6-delivery-readiness-v1" as const;

export const PI7_FREEZE_REF = "pi-7-product-implementation-v1" as const;
