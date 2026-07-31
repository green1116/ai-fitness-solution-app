/**
 * PI-6.2 — Compose delivery readiness runtime plan from PI-6.1 foundation.
 * Does not invoke FE/BE/Data/Integration modules.
 */
import { DELIVERY_FOUNDATION_ID } from "../foundation/delivery.constants";
import {
  DELIVERY_GOLDEN_PATH_IDS,
  type DeliveryEnvironmentId,
  type DeliveryGoldenPathId,
} from "../foundation/environments";
import {
  DELIVERY_DOMAIN_IDS,
  type DeliveryDomainId,
} from "../foundation/layer-refs";
import {
  DELIVERY_READINESS_CONCERN_CATALOGUE,
  type DeliveryReadinessConcernId,
} from "../foundation/readiness-concerns";
import {
  concernMatchesFoundation,
  getConcernRuntimeBinding,
  type ConcernRuntimeBinding,
  type DeliveryRuntimeMode,
} from "./concern-runtime-bindings";
import {
  environmentMatchesFoundation,
  getEnvironmentRuntimeBinding,
  type EnvironmentRuntimeBinding,
} from "./environment-runtime-bindings";
import {
  layerAdapterForId,
  layerAdapterMatchesFoundation,
  type DeliveryRuntimeAdapter,
} from "./layer-runtime-bindings";
import {
  DELIVERY_FOUNDATION_REF,
  DELIVERY_READINESS_REF,
  DELIVERY_RUNTIME_ID,
} from "./runtime.constants";

export type DeliveryRuntimePlan = Readonly<{
  runtimeId: typeof DELIVERY_RUNTIME_ID;
  foundationId: typeof DELIVERY_FOUNDATION_ID;
  readinessRef: typeof DELIVERY_READINESS_REF;
  concernId: DeliveryReadinessConcernId;
  mode: DeliveryRuntimeMode;
  concern: ConcernRuntimeBinding;
  adapters: readonly DeliveryRuntimeAdapter[];
  primaryAdapter: DeliveryRuntimeAdapter;
  targetEnvIds: readonly DeliveryEnvironmentId[];
  environmentBindings: readonly EnvironmentRuntimeBinding[];
  domains: readonly DeliveryDomainId[];
  goldenPaths: readonly DeliveryGoldenPathId[];
  matchesFoundation: boolean;
  reusesExistingLayers: boolean;
}>;

/**
 * Bind a readiness concern to existing layer adapters + environment runtimes.
 */
export function resolveDeliveryRuntimePlan(
  concernId: DeliveryReadinessConcernId,
  primaryDomain: DeliveryDomainId | null = null,
): DeliveryRuntimePlan {
  const concern = getConcernRuntimeBinding(concernId);
  if (!concern) {
    throw new Error(`Unknown concern runtime binding: ${concernId}`);
  }

  const foundationConcern = DELIVERY_READINESS_CONCERN_CATALOGUE.find(
    (c) => c.concernId === concernId,
  );
  if (!foundationConcern) {
    throw new Error(`Concern ${concernId} not in PI-6.1 foundation`);
  }

  const adapters = concern.requiredLayerIds.map((layerId) => {
    const adapter = layerAdapterForId(layerId);
    if (!adapter) {
      throw new Error(`No layer runtime adapter for ${layerId}`);
    }
    return adapter;
  });

  const primaryAdapter = adapters[0];
  if (!primaryAdapter) {
    throw new Error(`No primary adapter for ${concernId}`);
  }

  const environmentBindings = concern.targetEnvIds.map((envId) => {
    const binding = getEnvironmentRuntimeBinding(envId);
    if (!binding) {
      throw new Error(`Unknown environment runtime binding: ${envId}`);
    }
    return binding;
  });

  const reusesExistingLayers = adapters.every((adapter) =>
    layerAdapterMatchesFoundation(adapter),
  );

  const matchesFoundation =
    DELIVERY_FOUNDATION_REF === DELIVERY_FOUNDATION_ID &&
    concernMatchesFoundation(concern) &&
    environmentBindings.every((eb) => environmentMatchesFoundation(eb)) &&
    reusesExistingLayers &&
    (primaryDomain === null ||
      (DELIVERY_DOMAIN_IDS as readonly string[]).includes(primaryDomain));

  return {
    runtimeId: DELIVERY_RUNTIME_ID,
    foundationId: DELIVERY_FOUNDATION_ID,
    readinessRef: DELIVERY_READINESS_REF,
    concernId,
    mode: concern.mode,
    concern,
    adapters,
    primaryAdapter,
    targetEnvIds: concern.targetEnvIds,
    environmentBindings,
    domains: [...DELIVERY_DOMAIN_IDS],
    goldenPaths: concern.requiresGoldenPaths
      ? [...DELIVERY_GOLDEN_PATH_IDS]
      : [],
    matchesFoundation,
    reusesExistingLayers,
  };
}
