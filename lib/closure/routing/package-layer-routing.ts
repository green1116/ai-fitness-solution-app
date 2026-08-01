/**
 * PI-8.2 — Package → primary layer routing (PI-8.1 layers).
 * Reuses existing FE/BE/Data/Integration/Delivery/Implementation/Domain.
 */
import {
  CLOSURE_LAYER_CATALOGUE,
  type ClosureLayerId,
} from "../foundation/layer-refs";
import {
  CLOSURE_PACKAGE_CATALOGUE,
  type ClosurePackageId,
} from "../foundation/package-refs";

export type ClosurePackageLayerRoute = Readonly<{
  packageId: ClosurePackageId;
  primaryLayerId: ClosureLayerId;
  supportingLayerIds: readonly ClosureLayerId[];
  notes: string;
}>;

/**
 * Closed package → layer routes — one per PI-8.1 package.
 */
export const CLOSURE_PACKAGE_LAYER_ROUTES = [
  {
    packageId: "PI-2",
    primaryLayerId: "FRONTEND",
    supportingLayerIds: ["DOMAIN"],
    notes: "Frontend owns presentation; Domains supply outcomes",
  },
  {
    packageId: "PI-3",
    primaryLayerId: "BACKEND",
    supportingLayerIds: ["DOMAIN", "DATA"],
    notes: "Backend orchestrates Domains / persistence ports",
  },
  {
    packageId: "PI-4",
    primaryLayerId: "DATA",
    supportingLayerIds: ["DOMAIN"],
    notes: "Data owns persistence; Domains consume ports",
  },
  {
    packageId: "PI-5",
    primaryLayerId: "INTEGRATION",
    supportingLayerIds: ["FRONTEND", "BACKEND", "DATA", "DOMAIN"],
    notes: "Integration binds FE/BE/Data/Domain seams",
  },
  {
    packageId: "PI-6",
    primaryLayerId: "DELIVERY",
    supportingLayerIds: [
      "FRONTEND",
      "BACKEND",
      "DATA",
      "INTEGRATION",
      "DOMAIN",
    ],
    notes: "Delivery readiness consumes implementation layers",
  },
  {
    packageId: "PI-7",
    primaryLayerId: "IMPLEMENTATION",
    supportingLayerIds: [
      "FRONTEND",
      "BACKEND",
      "DATA",
      "INTEGRATION",
      "DELIVERY",
      "DOMAIN",
    ],
    notes: "Implementation registry closes PI-2…PI-6 packages",
  },
] as const satisfies readonly ClosurePackageLayerRoute[];

export function getClosurePackageLayerRoute(
  packageId: ClosurePackageId,
): ClosurePackageLayerRoute | undefined {
  return CLOSURE_PACKAGE_LAYER_ROUTES.find((r) => r.packageId === packageId);
}

export function closurePackageLayerRouteMatchesFoundation(
  route: ClosurePackageLayerRoute,
): boolean {
  const pkg = CLOSURE_PACKAGE_CATALOGUE.find(
    (p) => p.packageId === route.packageId,
  );
  const primary = CLOSURE_LAYER_CATALOGUE.find(
    (l) => l.layerId === route.primaryLayerId,
  );
  const supportsOk = route.supportingLayerIds.every((id) =>
    CLOSURE_LAYER_CATALOGUE.some((l) => l.layerId === id),
  );
  return Boolean(pkg && primary && supportsOk);
}
