/**
 * PI-7.1 — Product Implementation Foundation constants (PD-7 / PI-6).
 * Registry only — reuses FE / BE / Data / Integration / Delivery / M11–M15;
 * invents no architecture.
 */
export const IMPLEMENTATION_FOUNDATION_ID =
  "product-implementation-foundation-v1" as const;

export const IMPLEMENTATION_FOUNDATION_GATE =
  "product-implementation-foundation-gate" as const;

/** Closure baseline over existing PI packages — not a new architecture. */
export const IMPLEMENTATION_BASELINE_ID =
  "product-implementation-baseline-v1" as const;

export const IMPLEMENTATION_BASELINE_GATE =
  "product-implementation-baseline-gate" as const;

export const IMPLEMENTATION_BASELINE_REF =
  "product-implementation-baseline-v1" as const;

export const PI71_PACKAGE_ID = "PI-7.1" as const;

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

export const DELIVERY_FREEZE_REF = "product-delivery-freeze-1" as const;

export const PI2_FREEZE_REF = "pi-2-frontend-implementation-v1" as const;

export const PI3_FREEZE_REF = "pi-3-backend-implementation-v1" as const;

export const PI4_FREEZE_REF = "pi-4-data-implementation-v1" as const;

export const PI5_FREEZE_REF = "pi-5-integration-implementation-v1" as const;

export const PI6_FREEZE_REF = "pi-6-delivery-readiness-v1" as const;
