/**
 * PI-8.3 — Compose closure runtime plan from PI-8.2 package routing.
 * Does not invoke FE/BE/Data/Integration/Delivery/Implementation modules.
 */
import { CLOSURE_FOUNDATION_ID } from "../foundation/closure.constants";
import type { ClosureDomainId } from "../foundation/layer-refs";
import type { ClosurePackageId } from "../foundation/package-refs";
import { CLOSURE_ROUTING_LAYER_ID } from "../routing/routing.constants";
import {
  resolveClosureRoutePlan,
  type ClosureRoutePlan,
} from "../routing/closure-route-plan";
import {
  closureLayerAdapterForId,
  closureLayerAdapterMatchesFoundation,
  type ClosureRuntimeAdapter,
} from "./layer-runtime-bindings";
import {
  closurePackageRuntimeMatchesFoundation,
  getClosurePackageRuntimeBinding,
  type ClosurePackageRuntimeBinding,
  type ClosureRuntimeMode,
} from "./package-runtime-bindings";
import {
  CLOSURE_FOUNDATION_REF,
  CLOSURE_ROUTING_REF,
  CLOSURE_RUNTIME_ID,
} from "./runtime.constants";

export type ClosureRuntimePlan = Readonly<{
  runtimeId: typeof CLOSURE_RUNTIME_ID;
  routingLayerId: typeof CLOSURE_ROUTING_LAYER_ID;
  foundationId: typeof CLOSURE_FOUNDATION_ID;
  packageId: ClosurePackageId;
  mode: ClosureRuntimeMode;
  packageBinding: ClosurePackageRuntimeBinding;
  route: ClosureRoutePlan;
  adapters: readonly ClosureRuntimeAdapter[];
  primaryAdapter: ClosureRuntimeAdapter;
  matchesRouting: boolean;
  reusesExistingLayers: boolean;
  reusesExistingDomains: boolean;
}>;

/**
 * Bind a package route to existing layer runtime adapters.
 */
export function resolveClosureRuntimePlan(
  packageId: ClosurePackageId,
  primaryDomain: ClosureDomainId | null = null,
): ClosureRuntimePlan {
  const packageBinding = getClosurePackageRuntimeBinding(packageId);
  if (!packageBinding) {
    throw new Error(`Unknown closure package runtime binding: ${packageId}`);
  }

  const route = resolveClosureRoutePlan(packageId, primaryDomain);

  const adapters = route.layerIds.map((layerId) => {
    const adapter = closureLayerAdapterForId(layerId);
    if (!adapter) {
      throw new Error(`No closure layer runtime adapter for ${layerId}`);
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
    closureLayerAdapterMatchesFoundation(adapter),
  );

  const matchesRouting =
    CLOSURE_ROUTING_REF === CLOSURE_ROUTING_LAYER_ID &&
    CLOSURE_FOUNDATION_REF === CLOSURE_FOUNDATION_ID &&
    route.layerId === CLOSURE_ROUTING_LAYER_ID &&
    route.matchesFoundation &&
    route.reusesExistingLayers &&
    route.reusesExistingDomains &&
    closurePackageRuntimeMatchesFoundation(packageBinding) &&
    reusesExistingLayers &&
    primaryAdapter.layerId === route.primaryLayerId;

  return {
    runtimeId: CLOSURE_RUNTIME_ID,
    routingLayerId: CLOSURE_ROUTING_LAYER_ID,
    foundationId: CLOSURE_FOUNDATION_ID,
    packageId,
    mode: packageBinding.mode,
    packageBinding,
    route,
    adapters,
    primaryAdapter,
    matchesRouting,
    reusesExistingLayers,
    reusesExistingDomains: route.reusesExistingDomains,
  };
}
