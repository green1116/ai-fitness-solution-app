/**
 * PI-8.1 — Closed Product Closure packages (PI-2…PI-7).
 * Registry of existing freezes — invents none.
 */
export const CLOSURE_PACKAGE_IDS = [
  "PI-2",
  "PI-3",
  "PI-4",
  "PI-5",
  "PI-6",
  "PI-7",
] as const;

export type ClosurePackageId = (typeof CLOSURE_PACKAGE_IDS)[number];

export type ClosurePackageRef = Readonly<{
  packageId: ClosurePackageId;
  order: number;
  freezeId: string;
  baselineId: string;
  evidenceScript: string;
  modulePath: string;
  role: string;
}>;

export const CLOSURE_PACKAGE_CATALOGUE = [
  {
    packageId: "PI-2",
    order: 1,
    freezeId: "pi-2-frontend-implementation-v1",
    baselineId: "product-implementation-frontend-v1",
    evidenceScript: "scripts/verify-pi-2.ts",
    modulePath: "lib/frontend",
    role: "Frontend implementation",
  },
  {
    packageId: "PI-3",
    order: 2,
    freezeId: "pi-3-backend-implementation-v1",
    baselineId: "product-implementation-backend-v1",
    evidenceScript: "scripts/verify-pi-3.ts",
    modulePath: "lib/backend",
    role: "Backend implementation",
  },
  {
    packageId: "PI-4",
    order: 3,
    freezeId: "pi-4-data-implementation-v1",
    baselineId: "product-implementation-data-v1",
    evidenceScript: "scripts/verify-pi-4.ts",
    modulePath: "lib/data",
    role: "Data / persistence implementation",
  },
  {
    packageId: "PI-5",
    order: 4,
    freezeId: "pi-5-integration-implementation-v1",
    baselineId: "product-implementation-integration-v1",
    evidenceScript: "scripts/verify-pi-5.ts",
    modulePath: "lib/integration",
    role: "Integration implementation",
  },
  {
    packageId: "PI-6",
    order: 5,
    freezeId: "pi-6-delivery-readiness-v1",
    baselineId: "product-implementation-delivery-readiness-v1",
    evidenceScript: "scripts/verify-pi-6.ts",
    modulePath: "lib/delivery",
    role: "Delivery readiness implementation",
  },
  {
    packageId: "PI-7",
    order: 6,
    freezeId: "pi-7-product-implementation-v1",
    baselineId: "product-implementation-complete-v1",
    evidenceScript: "scripts/verify-pi-7.ts",
    modulePath: "lib/implementation",
    role: "Product implementation closure registry",
  },
] as const satisfies readonly ClosurePackageRef[];
