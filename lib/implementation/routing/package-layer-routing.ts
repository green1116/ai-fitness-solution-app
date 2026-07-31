/**
 * PI-7.2 — Package → primary layer routing (PI-7.1 layers).
 * Reuses existing FE/BE/Data/Integration/Delivery/Domain — invents none.
 */
import {
  IMPLEMENTATION_LAYER_CATALOGUE,
  type ImplementationLayerId,
} from "../foundation/layer-refs";
import {
  IMPLEMENTATION_PACKAGE_CATALOGUE,
  type ImplementationPackageId,
} from "../foundation/package-refs";

export type PackageLayerRoute = Readonly<{
  packageId: ImplementationPackageId;
  primaryLayerId: ImplementationLayerId;
  supportingLayerIds: readonly ImplementationLayerId[];
  notes: string;
}>;

/**
 * Closed package → layer routes — one per PI-7.1 package.
 */
export const PACKAGE_LAYER_ROUTES = [
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
    notes: "Delivery readiness consumes all implementation layers",
  },
] as const satisfies readonly PackageLayerRoute[];

export function getPackageLayerRoute(
  packageId: ImplementationPackageId,
): PackageLayerRoute | undefined {
  return PACKAGE_LAYER_ROUTES.find((r) => r.packageId === packageId);
}

export function packageLayerRouteMatchesFoundation(
  route: PackageLayerRoute,
): boolean {
  const pkg = IMPLEMENTATION_PACKAGE_CATALOGUE.find(
    (p) => p.packageId === route.packageId,
  );
  const primary = IMPLEMENTATION_LAYER_CATALOGUE.find(
    (l) => l.layerId === route.primaryLayerId,
  );
  const supportsOk = route.supportingLayerIds.every((id) =>
    IMPLEMENTATION_LAYER_CATALOGUE.some((l) => l.layerId === id),
  );
  return Boolean(pkg && primary && supportsOk);
}
