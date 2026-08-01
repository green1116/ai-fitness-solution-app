/**
 * AE-1 — Application registry of existing frozen surfaces.
 * Path / ID refs only — no FE/BE/Data/Integration/Delivery/Implementation/Closure imports.
 */

export const AE1_SURFACE_IDS = [
  "PRODUCT_DEFINITION",
  "PIG",
  "FRONTEND",
  "BACKEND",
  "DATA",
  "INTEGRATION",
  "DELIVERY",
  "IMPLEMENTATION",
  "DOMAIN",
  "CLOSURE",
] as const;

export type Ae1SurfaceId = (typeof AE1_SURFACE_IDS)[number];

export type Ae1SurfaceRef = Readonly<{
  surfaceId: Ae1SurfaceId;
  freezeOrBaselineRef: string;
  modulePath: string | null;
  evidenceScript: string | null;
  role: string;
}>;

/**
 * Closed catalogue of existing surfaces assembled by AE-1.
 */
export const AE1_SURFACE_REGISTRY = [
  {
    surfaceId: "PRODUCT_DEFINITION",
    freezeOrBaselineRef: "product-definition-v1",
    modulePath: "docs/product-definition",
    evidenceScript: null,
    role: "Product Definition v1 (frozen)",
  },
  {
    surfaceId: "PIG",
    freezeOrBaselineRef: "product-implementation-governance-v1",
    modulePath: null,
    evidenceScript: null,
    role: "Product Implementation Governance v1 (frozen)",
  },
  {
    surfaceId: "FRONTEND",
    freezeOrBaselineRef: "pi-2-frontend-implementation-v1",
    modulePath: "lib/frontend",
    evidenceScript: "scripts/verify-pi-2.ts",
    role: "Frontend implementation (PI-2)",
  },
  {
    surfaceId: "BACKEND",
    freezeOrBaselineRef: "pi-3-backend-implementation-v1",
    modulePath: "lib/backend",
    evidenceScript: "scripts/verify-pi-3.ts",
    role: "Backend implementation (PI-3)",
  },
  {
    surfaceId: "DATA",
    freezeOrBaselineRef: "pi-4-data-implementation-v1",
    modulePath: "lib/data",
    evidenceScript: "scripts/verify-pi-4.ts",
    role: "Data implementation (PI-4)",
  },
  {
    surfaceId: "INTEGRATION",
    freezeOrBaselineRef: "pi-5-integration-implementation-v1",
    modulePath: "lib/integration",
    evidenceScript: "scripts/verify-pi-5.ts",
    role: "Integration implementation (PI-5)",
  },
  {
    surfaceId: "DELIVERY",
    freezeOrBaselineRef: "pi-6-delivery-readiness-v1",
    modulePath: "lib/delivery",
    evidenceScript: "scripts/verify-pi-6.ts",
    role: "Delivery readiness (PI-6)",
  },
  {
    surfaceId: "IMPLEMENTATION",
    freezeOrBaselineRef: "pi-7-product-implementation-v1",
    modulePath: "lib/implementation",
    evidenceScript: "scripts/verify-pi-7.ts",
    role: "Product implementation registry (PI-7)",
  },
  {
    surfaceId: "DOMAIN",
    freezeOrBaselineRef: "product-ui-baseline-v1",
    modulePath: "lib/product",
    evidenceScript: null,
    role: "Existing Domains M11–M15",
  },
  {
    surfaceId: "CLOSURE",
    freezeOrBaselineRef: "pi-8-product-closure-v1",
    modulePath: "lib/closure",
    evidenceScript: "scripts/verify-pi-8.ts",
    role: "Product Closure (PI-8)",
  },
] as const satisfies readonly Ae1SurfaceRef[];

export const AE1_PACKAGE_IDS = [
  "PI-1",
  "PI-2",
  "PI-3",
  "PI-4",
  "PI-5",
  "PI-6",
  "PI-7",
  "PI-8",
] as const;

export type Ae1PackageId = (typeof AE1_PACKAGE_IDS)[number];

export type Ae1PackageRef = Readonly<{
  packageId: Ae1PackageId;
  freezeId: string;
  evidenceScript: string | null;
  role: string;
}>;

export const AE1_PACKAGE_REGISTRY = [
  {
    packageId: "PI-1",
    freezeId: "pi-1-foundation-v1",
    evidenceScript: null,
    role: "Engineering readiness / foundation",
  },
  {
    packageId: "PI-2",
    freezeId: "pi-2-frontend-implementation-v1",
    evidenceScript: "scripts/verify-pi-2.ts",
    role: "Frontend implementation",
  },
  {
    packageId: "PI-3",
    freezeId: "pi-3-backend-implementation-v1",
    evidenceScript: "scripts/verify-pi-3.ts",
    role: "Backend implementation",
  },
  {
    packageId: "PI-4",
    freezeId: "pi-4-data-implementation-v1",
    evidenceScript: "scripts/verify-pi-4.ts",
    role: "Data implementation",
  },
  {
    packageId: "PI-5",
    freezeId: "pi-5-integration-implementation-v1",
    evidenceScript: "scripts/verify-pi-5.ts",
    role: "Integration implementation",
  },
  {
    packageId: "PI-6",
    freezeId: "pi-6-delivery-readiness-v1",
    evidenceScript: "scripts/verify-pi-6.ts",
    role: "Delivery readiness",
  },
  {
    packageId: "PI-7",
    freezeId: "pi-7-product-implementation-v1",
    evidenceScript: "scripts/verify-pi-7.ts",
    role: "Product implementation",
  },
  {
    packageId: "PI-8",
    freezeId: "pi-8-product-closure-v1",
    evidenceScript: "scripts/verify-pi-8.ts",
    role: "Product closure",
  },
] as const satisfies readonly Ae1PackageRef[];

export const AE1_DOMAIN_IDS = ["M11", "M12", "M13", "M14", "M15"] as const;

export type Ae1DomainId = (typeof AE1_DOMAIN_IDS)[number];

export const AE1_DOMAIN_MODULE_PATHS = {
  M11: "lib/product/m11",
  M12: "lib/product/m12",
  M13: "lib/product/m13",
  M14: "lib/product/m14",
  M15: "lib/product/m15",
} as const satisfies Record<Ae1DomainId, string>;

export function getAe1Surface(
  surfaceId: Ae1SurfaceId,
): Ae1SurfaceRef | undefined {
  return AE1_SURFACE_REGISTRY.find((s) => s.surfaceId === surfaceId);
}

export function getAe1Package(
  packageId: Ae1PackageId,
): Ae1PackageRef | undefined {
  return AE1_PACKAGE_REGISTRY.find((p) => p.packageId === packageId);
}
