/**
 * AE-1 — Declarative application composition.
 * Composes registry entries only — no runtime invocation / workflow / deployment.
 */
import {
  AE1_DOMAIN_IDS,
  AE1_PACKAGE_IDS,
  AE1_SURFACE_IDS,
  getAe1Package,
  getAe1Surface,
  type Ae1DomainId,
  type Ae1PackageId,
  type Ae1SurfaceId,
} from "./application.registry";

export type Ae1CompositionSlot = Readonly<{
  order: number;
  surfaceId: Ae1SurfaceId;
  packageId: Ae1PackageId | null;
  notes: string;
}>;

/**
 * Closed composition order — assembly view of frozen surfaces.
 * Not an execution / workflow order.
 */
export const AE1_COMPOSITION_SLOTS = [
  {
    order: 1,
    surfaceId: "PRODUCT_DEFINITION",
    packageId: null,
    notes: "Product Definition anchors scope",
  },
  {
    order: 2,
    surfaceId: "PIG",
    packageId: null,
    notes: "Implementation governance anchors constraints",
  },
  {
    order: 3,
    surfaceId: "DOMAIN",
    packageId: null,
    notes: "Domains M11–M15 supply outcomes (PI-1 foundation is package-registry only)",
  },
  {
    order: 4,
    surfaceId: "FRONTEND",
    packageId: "PI-2",
    notes: "Frontend presentation surface",
  },
  {
    order: 5,
    surfaceId: "BACKEND",
    packageId: "PI-3",
    notes: "Backend orchestration surface",
  },
  {
    order: 6,
    surfaceId: "DATA",
    packageId: "PI-4",
    notes: "Data persistence surface",
  },
  {
    order: 7,
    surfaceId: "INTEGRATION",
    packageId: "PI-5",
    notes: "Integration seam surface",
  },
  {
    order: 8,
    surfaceId: "DELIVERY",
    packageId: "PI-6",
    notes: "Delivery readiness surface",
  },
  {
    order: 9,
    surfaceId: "IMPLEMENTATION",
    packageId: "PI-7",
    notes: "Implementation registry surface",
  },
  {
    order: 10,
    surfaceId: "CLOSURE",
    packageId: "PI-8",
    notes: "Product closure surface (base freeze)",
  },
] as const satisfies readonly Ae1CompositionSlot[];

export type ApplicationComposition = Readonly<{
  slots: typeof AE1_COMPOSITION_SLOTS;
  surfaceIds: typeof AE1_SURFACE_IDS;
  packageIds: typeof AE1_PACKAGE_IDS;
  domainIds: typeof AE1_DOMAIN_IDS;
  chain: string;
  registryAligned: boolean;
}>;

/**
 * Resolve declarative composition — validates registry alignment only.
 */
export function resolveApplicationComposition(): ApplicationComposition {
  const registryAligned = AE1_COMPOSITION_SLOTS.every((slot) => {
    const surface = getAe1Surface(slot.surfaceId);
    if (!surface) return false;
    if (slot.packageId === null) return true;
    const pkg = getAe1Package(slot.packageId);
    return Boolean(pkg);
  });

  const chain = AE1_COMPOSITION_SLOTS.map((s) => s.surfaceId).join("→");

  return {
    slots: AE1_COMPOSITION_SLOTS,
    surfaceIds: AE1_SURFACE_IDS,
    packageIds: AE1_PACKAGE_IDS,
    domainIds: AE1_DOMAIN_IDS,
    chain,
    registryAligned,
  };
}

export function compositionIncludesDomain(
  domainId: Ae1DomainId,
): boolean {
  return (AE1_DOMAIN_IDS as readonly string[]).includes(domainId);
}
