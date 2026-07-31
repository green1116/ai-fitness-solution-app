/**
 * PI-7.1 — Existing product layers reused by Product Implementation.
 * Path/ID refs only — no FE/BE/Data/Integration/Delivery module imports.
 */
export const IMPLEMENTATION_LAYER_IDS = [
  "FRONTEND",
  "BACKEND",
  "DATA",
  "INTEGRATION",
  "DELIVERY",
  "DOMAIN",
] as const;

export type ImplementationLayerId =
  (typeof IMPLEMENTATION_LAYER_IDS)[number];

export type ImplementationLayerRef = Readonly<{
  layerId: ImplementationLayerId;
  baselineOrFoundationId: string;
  freezeRef: string;
  modulePath: string;
  role: string;
}>;

/**
 * Closed catalogue of existing layers consumed by PI-7.
 */
export const IMPLEMENTATION_LAYER_CATALOGUE = [
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
    layerId: "DOMAIN",
    baselineOrFoundationId: "M11–M15",
    freezeRef: "product-ui-baseline-v1",
    modulePath: "lib/product",
    role: "Existing Domains only (M11–M15)",
  },
] as const satisfies readonly ImplementationLayerRef[];

/** Existing Domain module paths (M11–M15 only). */
export const IMPLEMENTATION_DOMAIN_IDS = [
  "M11",
  "M12",
  "M13",
  "M14",
  "M15",
] as const;

export type ImplementationDomainId =
  (typeof IMPLEMENTATION_DOMAIN_IDS)[number];

export const IMPLEMENTATION_DOMAIN_MODULE_PATHS = {
  M11: "lib/product/m11",
  M12: "lib/product/m12",
  M13: "lib/product/m13",
  M14: "lib/product/m14",
  M15: "lib/product/m15",
} as const satisfies Record<ImplementationDomainId, string>;
