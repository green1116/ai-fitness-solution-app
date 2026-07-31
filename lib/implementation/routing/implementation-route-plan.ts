/**
 * PI-7.2 — Compose implementation package route plans from PI-7.1 foundation.
 * Does not invoke FE/BE/Data/Integration/Delivery modules.
 */
import { IMPLEMENTATION_FOUNDATION_ID } from "../foundation/implementation.constants";
import {
  IMPLEMENTATION_DOMAIN_IDS,
  IMPLEMENTATION_LAYER_CATALOGUE,
  type ImplementationDomainId,
  type ImplementationLayerId,
} from "../foundation/layer-refs";
import {
  IMPLEMENTATION_PACKAGE_CATALOGUE,
  type ImplementationPackageId,
  type ImplementationPackageRef,
} from "../foundation/package-refs";
import {
  getPackageDependencyRoute,
  IMPLEMENTATION_PACKAGE_CHAIN,
  packageDependencyMatchesFoundation,
  type PackageDependencyRoute,
} from "./dependency-routing";
import {
  isImplementationDomainId,
  packageAllowsDomainBias,
} from "./domain-package-routing";
import {
  getPackageLayerRoute,
  packageLayerRouteMatchesFoundation,
  type PackageLayerRoute,
} from "./package-layer-routing";
import {
  IMPLEMENTATION_FOUNDATION_REF,
  IMPLEMENTATION_ROUTING_LAYER_ID,
} from "./routing.constants";

export type ImplementationRoutePlan = Readonly<{
  layerId: typeof IMPLEMENTATION_ROUTING_LAYER_ID;
  foundationId: typeof IMPLEMENTATION_FOUNDATION_ID;
  packageId: ImplementationPackageId;
  packageRef: ImplementationPackageRef;
  layerRoute: PackageLayerRoute;
  dependency: PackageDependencyRoute;
  primaryLayerId: ImplementationLayerId;
  layerIds: readonly ImplementationLayerId[];
  chain: readonly ImplementationPackageId[];
  primaryDomain: ImplementationDomainId | null;
  domains: readonly ImplementationDomainId[];
  matchesFoundation: boolean;
  reusesExistingLayers: boolean;
}>;

/**
 * Plan the implementation route for a package (+ optional Domain bias).
 */
export function resolveImplementationRoutePlan(
  packageId: ImplementationPackageId,
  primaryDomain: ImplementationDomainId | null = null,
): ImplementationRoutePlan {
  const packageRef = IMPLEMENTATION_PACKAGE_CATALOGUE.find(
    (p) => p.packageId === packageId,
  );
  if (!packageRef) {
    throw new Error(`Unknown implementation package: ${packageId}`);
  }

  const layerRoute = getPackageLayerRoute(packageId);
  if (!layerRoute) {
    throw new Error(`No package layer route for ${packageId}`);
  }

  const dependency = getPackageDependencyRoute(packageId);
  if (!dependency) {
    throw new Error(`No package dependency route for ${packageId}`);
  }

  if (primaryDomain !== null) {
    if (!packageAllowsDomainBias(packageId)) {
      throw new Error(`Package ${packageId} cannot declare Domain bias`);
    }
    if (!isImplementationDomainId(primaryDomain)) {
      throw new Error(`Unknown Domain: ${primaryDomain}`);
    }
  }

  const layerIds = [
    layerRoute.primaryLayerId,
    ...layerRoute.supportingLayerIds,
  ] as ImplementationLayerId[];

  const reusesExistingLayers = layerIds.every((id) =>
    IMPLEMENTATION_LAYER_CATALOGUE.some((l) => l.layerId === id),
  );

  const matchesFoundation =
    IMPLEMENTATION_FOUNDATION_REF === IMPLEMENTATION_FOUNDATION_ID &&
    packageLayerRouteMatchesFoundation(layerRoute) &&
    packageDependencyMatchesFoundation(dependency) &&
    reusesExistingLayers &&
    IMPLEMENTATION_PACKAGE_CHAIN.join("→") === "PI-2→PI-3→PI-4→PI-5→PI-6";

  return {
    layerId: IMPLEMENTATION_ROUTING_LAYER_ID,
    foundationId: IMPLEMENTATION_FOUNDATION_ID,
    packageId,
    packageRef,
    layerRoute,
    dependency,
    primaryLayerId: layerRoute.primaryLayerId,
    layerIds,
    chain: [...IMPLEMENTATION_PACKAGE_CHAIN],
    primaryDomain,
    domains: [...IMPLEMENTATION_DOMAIN_IDS],
    matchesFoundation,
    reusesExistingLayers,
  };
}
