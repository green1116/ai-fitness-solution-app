/**
 * PI-7.3 — Compose implementation runtime plan from PI-7.2 package routing.
 * Does not invoke FE/BE/Data/Integration/Delivery modules.
 */
import { IMPLEMENTATION_FOUNDATION_ID } from "../foundation/implementation.constants";
import type { ImplementationDomainId } from "../foundation/layer-refs";
import type { ImplementationPackageId } from "../foundation/package-refs";
import { IMPLEMENTATION_ROUTING_LAYER_ID } from "../routing/routing.constants";
import {
  resolveImplementationRoutePlan,
  type ImplementationRoutePlan,
} from "../routing/implementation-route-plan";
import {
  layerAdapterForId,
  layerAdapterMatchesFoundation,
  type ImplementationRuntimeAdapter,
} from "./layer-runtime-bindings";
import {
  getPackageRuntimeBinding,
  packageRuntimeMatchesFoundation,
  type ImplementationRuntimeMode,
  type PackageRuntimeBinding,
} from "./package-runtime-bindings";
import {
  IMPLEMENTATION_FOUNDATION_REF,
  IMPLEMENTATION_ROUTING_REF,
  IMPLEMENTATION_RUNTIME_ID,
} from "./runtime.constants";

export type ImplementationRuntimePlan = Readonly<{
  runtimeId: typeof IMPLEMENTATION_RUNTIME_ID;
  routingLayerId: typeof IMPLEMENTATION_ROUTING_LAYER_ID;
  foundationId: typeof IMPLEMENTATION_FOUNDATION_ID;
  packageId: ImplementationPackageId;
  mode: ImplementationRuntimeMode;
  packageBinding: PackageRuntimeBinding;
  route: ImplementationRoutePlan;
  adapters: readonly ImplementationRuntimeAdapter[];
  primaryAdapter: ImplementationRuntimeAdapter;
  matchesRouting: boolean;
  reusesExistingLayers: boolean;
}>;

/**
 * Bind a package route to existing layer runtime adapters.
 */
export function resolveImplementationRuntimePlan(
  packageId: ImplementationPackageId,
  primaryDomain: ImplementationDomainId | null = null,
): ImplementationRuntimePlan {
  const packageBinding = getPackageRuntimeBinding(packageId);
  if (!packageBinding) {
    throw new Error(`Unknown package runtime binding: ${packageId}`);
  }

  const route = resolveImplementationRoutePlan(packageId, primaryDomain);

  const adapters = route.layerIds.map((layerId) => {
    const adapter = layerAdapterForId(layerId);
    if (!adapter) {
      throw new Error(`No layer runtime adapter for ${layerId}`);
    }
    return adapter;
  });

  const primaryAdapter = adapters.find(
    (a) => a.layerId === route.primaryLayerId,
  );
  if (!primaryAdapter) {
    throw new Error(`No primary adapter for ${packageId}`);
  }

  const reusesExistingLayers = adapters.every((adapter) =>
    layerAdapterMatchesFoundation(adapter),
  );

  const matchesRouting =
    IMPLEMENTATION_ROUTING_REF === IMPLEMENTATION_ROUTING_LAYER_ID &&
    IMPLEMENTATION_FOUNDATION_REF === IMPLEMENTATION_FOUNDATION_ID &&
    route.layerId === IMPLEMENTATION_ROUTING_LAYER_ID &&
    route.matchesFoundation &&
    route.reusesExistingLayers &&
    packageRuntimeMatchesFoundation(packageBinding) &&
    reusesExistingLayers &&
    primaryAdapter.layerId === route.primaryLayerId;

  return {
    runtimeId: IMPLEMENTATION_RUNTIME_ID,
    routingLayerId: IMPLEMENTATION_ROUTING_LAYER_ID,
    foundationId: IMPLEMENTATION_FOUNDATION_ID,
    packageId,
    mode: packageBinding.mode,
    packageBinding,
    route,
    adapters,
    primaryAdapter,
    matchesRouting,
    reusesExistingLayers,
  };
}
