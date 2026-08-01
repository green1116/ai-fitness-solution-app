/**
 * PI-8.2 — Compose closure package route plans from PI-8.1 foundation.
 * Does not invoke FE/BE/Data/Integration/Delivery/Implementation modules.
 */
import { CLOSURE_FOUNDATION_ID } from "../foundation/closure.constants";
import {
  CLOSURE_DOMAIN_IDS,
  CLOSURE_LAYER_CATALOGUE,
  type ClosureDomainId,
  type ClosureLayerId,
} from "../foundation/layer-refs";
import {
  CLOSURE_PACKAGE_CATALOGUE,
  type ClosurePackageId,
  type ClosurePackageRef,
} from "../foundation/package-refs";
import {
  CLOSURE_PACKAGE_CHAIN,
  closurePackageDependencyMatchesFoundation,
  getClosurePackageDependencyRoute,
  type ClosurePackageDependencyRoute,
} from "./dependency-routing";
import {
  closurePackageAllowsDomainBias,
  isClosureDomainId,
} from "./domain-package-routing";
import {
  closurePackageLayerRouteMatchesFoundation,
  getClosurePackageLayerRoute,
  type ClosurePackageLayerRoute,
} from "./package-layer-routing";
import {
  CLOSURE_FOUNDATION_REF,
  CLOSURE_ROUTING_LAYER_ID,
} from "./routing.constants";

export type ClosureRoutePlan = Readonly<{
  layerId: typeof CLOSURE_ROUTING_LAYER_ID;
  foundationId: typeof CLOSURE_FOUNDATION_ID;
  packageId: ClosurePackageId;
  packageRef: ClosurePackageRef;
  layerRoute: ClosurePackageLayerRoute;
  dependency: ClosurePackageDependencyRoute;
  primaryLayerId: ClosureLayerId;
  layerIds: readonly ClosureLayerId[];
  chain: readonly ClosurePackageId[];
  primaryDomain: ClosureDomainId | null;
  domains: readonly ClosureDomainId[];
  matchesFoundation: boolean;
  reusesExistingLayers: boolean;
  reusesExistingDomains: boolean;
}>;

/**
 * Plan the closure route for a package (+ optional Domain bias).
 */
export function resolveClosureRoutePlan(
  packageId: ClosurePackageId,
  primaryDomain: ClosureDomainId | null = null,
): ClosureRoutePlan {
  const packageRef = CLOSURE_PACKAGE_CATALOGUE.find(
    (p) => p.packageId === packageId,
  );
  if (!packageRef) {
    throw new Error(`Unknown closure package: ${packageId}`);
  }

  const layerRoute = getClosurePackageLayerRoute(packageId);
  if (!layerRoute) {
    throw new Error(`No closure package layer route for ${packageId}`);
  }

  const dependency = getClosurePackageDependencyRoute(packageId);
  if (!dependency) {
    throw new Error(`No closure package dependency route for ${packageId}`);
  }

  if (primaryDomain !== null) {
    if (!closurePackageAllowsDomainBias(packageId)) {
      throw new Error(`Package ${packageId} cannot declare Domain bias`);
    }
    if (!isClosureDomainId(primaryDomain)) {
      throw new Error(`Unknown Domain: ${primaryDomain}`);
    }
  }

  const layerIds = [
    layerRoute.primaryLayerId,
    ...layerRoute.supportingLayerIds,
  ] as ClosureLayerId[];

  const reusesExistingLayers = layerIds.every((id) =>
    CLOSURE_LAYER_CATALOGUE.some((l) => l.layerId === id),
  );

  const reusesExistingDomains =
    CLOSURE_DOMAIN_IDS.join(",") === "M11,M12,M13,M14,M15";

  const matchesFoundation =
    CLOSURE_FOUNDATION_REF === CLOSURE_FOUNDATION_ID &&
    closurePackageLayerRouteMatchesFoundation(layerRoute) &&
    closurePackageDependencyMatchesFoundation(dependency) &&
    reusesExistingLayers &&
    reusesExistingDomains &&
    CLOSURE_PACKAGE_CHAIN.join("→") === "PI-2→PI-3→PI-4→PI-5→PI-6→PI-7";

  return {
    layerId: CLOSURE_ROUTING_LAYER_ID,
    foundationId: CLOSURE_FOUNDATION_ID,
    packageId,
    packageRef,
    layerRoute,
    dependency,
    primaryLayerId: layerRoute.primaryLayerId,
    layerIds,
    chain: [...CLOSURE_PACKAGE_CHAIN],
    primaryDomain,
    domains: [...CLOSURE_DOMAIN_IDS],
    matchesFoundation,
    reusesExistingLayers,
    reusesExistingDomains,
  };
}
