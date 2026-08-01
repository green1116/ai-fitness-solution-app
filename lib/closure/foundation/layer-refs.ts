/**
 * PI-8.1 — Existing product layers reused by Product Closure.
 * Path/ID refs only — no FE/BE/Data/Integration/Delivery/Implementation imports.
 */
export const CLOSURE_LAYER_IDS = [
  "FRONTEND",
  "BACKEND",
  "DATA",
  "INTEGRATION",
  "DELIVERY",
  "IMPLEMENTATION",
  "DOMAIN",
] as const;

export type ClosureLayerId = (typeof CLOSURE_LAYER_IDS)[number];

export type ClosureLayerRef = Readonly<{
  layerId: ClosureLayerId;
  baselineOrFoundationId: string;
  freezeRef: string;
  modulePath: string;
  role: string;
}>;

/**
 * Closed catalogue of existing layers consumed by PI-8.
 */
export const CLOSURE_LAYER_CATALOGUE = [
  {
    layerId: "FRONTEND",
    baselineOrFoundationId: "product-frontend-architecture-baseline-v1",
    freezeRef: "pi-2-frontend-implementation-v1",
    modulePath: "lib/frontend",
    role: "Presentation / routes / adapter (PI-2)",
  },
  {
    layerId: "BACKEND",
    baselineOrFoundationId: "product-backend-architecture-baseline-v1",
    freezeRef: "pi-3-backend-implementation-v1",
    modulePath: "lib/backend",
    role: "API edge / services / domain ports (PI-3)",
  },
  {
    layerId: "DATA",
    baselineOrFoundationId: "product-data-foundation-v1",
    freezeRef: "pi-4-data-implementation-v1",
    modulePath: "lib/data",
    role: "Persistence ports / repositories (PI-4)",
  },
  {
    layerId: "INTEGRATION",
    baselineOrFoundationId: "product-integration-baseline-v1",
    freezeRef: "pi-5-integration-implementation-v1",
    modulePath: "lib/integration",
    role: "Foundation / routing / runtime / exposure (PI-5)",
  },
  {
    layerId: "DELIVERY",
    baselineOrFoundationId: "product-delivery-readiness-baseline-v1",
    freezeRef: "pi-6-delivery-readiness-v1",
    modulePath: "lib/delivery",
    role: "Delivery readiness (PI-6 / PD-7)",
  },
  {
    layerId: "IMPLEMENTATION",
    baselineOrFoundationId: "product-implementation-baseline-v1",
    freezeRef: "pi-7-product-implementation-v1",
    modulePath: "lib/implementation",
    role: "Product implementation registry (PI-7)",
  },
  {
    layerId: "DOMAIN",
    baselineOrFoundationId: "M11–M15",
    freezeRef: "product-ui-baseline-v1",
    modulePath: "lib/product",
    role: "Existing Domains only (M11–M15)",
  },
] as const satisfies readonly ClosureLayerRef[];

/** Existing Domain module paths (M11–M15 only). */
export const CLOSURE_DOMAIN_IDS = [
  "M11",
  "M12",
  "M13",
  "M14",
  "M15",
] as const;

export type ClosureDomainId = (typeof CLOSURE_DOMAIN_IDS)[number];

export const CLOSURE_DOMAIN_MODULE_PATHS = {
  M11: "lib/product/m11",
  M12: "lib/product/m12",
  M13: "lib/product/m13",
  M14: "lib/product/m14",
  M15: "lib/product/m15",
} as const satisfies Record<ClosureDomainId, string>;
