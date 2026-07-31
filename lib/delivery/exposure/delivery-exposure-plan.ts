/**
 * PI-6.3 — Compose delivery exposure with PI-6.2 runtime.
 * Does not invoke FE/BE/Data/Integration modules.
 */
import { DELIVERY_FOUNDATION_ID } from "../foundation/delivery.constants";
import type { DeliveryDomainId } from "../foundation/layer-refs";
import type { DeliveryReadinessConcernId } from "../foundation/readiness-concerns";
import { DELIVERY_RUNTIME_ID } from "../runtime/runtime.constants";
import {
  resolveDeliveryRuntimePlan,
  type DeliveryRuntimePlan,
} from "../runtime/delivery-runtime-plan";
import type { DeliveryRuntimeAdapter } from "../runtime/layer-runtime-bindings";
import {
  getConcernExposure,
  type ConcernExposure,
  type DeliveryExposureMode,
} from "./concern-exposure";
import {
  DELIVERY_EXPOSURE_LAYER_ID,
  DELIVERY_FOUNDATION_REF,
  DELIVERY_RUNTIME_REF,
} from "./exposure.constants";
import {
  SIGNAL_EXPOSURE_BINDINGS,
  type DeliveryExposureSignalId,
  type SignalExposureBinding,
} from "./signal-exposure-bindings";

export type DeliveryExposurePlan = Readonly<{
  layerId: typeof DELIVERY_EXPOSURE_LAYER_ID;
  runtimeId: typeof DELIVERY_RUNTIME_ID;
  foundationId: typeof DELIVERY_FOUNDATION_ID;
  concernId: DeliveryReadinessConcernId;
  primaryDomain: DeliveryDomainId | null;
  exposure: ConcernExposure;
  modes: readonly DeliveryExposureMode[];
  signals: readonly SignalExposureBinding[];
  runtime: DeliveryRuntimePlan;
  adapters: readonly DeliveryRuntimeAdapter[];
  matchesRuntime: boolean;
  reusesExistingLayers: boolean;
}>;

/**
 * Bind a readiness concern (+ Domain) to exposure modes + runtime plan.
 */
export function resolveDeliveryExposurePlan(
  concernId: DeliveryReadinessConcernId,
  primaryDomain: DeliveryDomainId | null = null,
): DeliveryExposurePlan {
  const exposure = getConcernExposure(concernId);
  if (!exposure) {
    throw new Error(`Unknown concern exposure: ${concernId}`);
  }

  const runtime = resolveDeliveryRuntimePlan(concernId, primaryDomain);

  const signals = exposure.signalIds.map((id) => {
    const row = SIGNAL_EXPOSURE_BINDINGS.find((s) => s.signalId === id);
    if (!row) throw new Error(`Unknown signal exposure: ${id}`);
    return row;
  });

  const runtimeModeMatches = exposure.runtimeMode === runtime.mode;

  const signalLayersCovered = signals.every((signal) =>
    signal.layerIds.every((layerId) => {
      if (runtime.adapters.some((a) => a.layerId === layerId)) {
        return true;
      }
      // CROSS baseline may cite layers not required by every concern —
      // only require coverage when signal is concern-scoped, or layer is on runtime.
      return signal.concernId === "CROSS";
    }),
  );

  const primaryExposed = runtime.adapters.some(
    (a) => a.layerId === exposure.primaryLayerId,
  );

  const matchesRuntime =
    runtime.runtimeId === DELIVERY_RUNTIME_ID &&
    DELIVERY_RUNTIME_REF === DELIVERY_RUNTIME_ID &&
    DELIVERY_FOUNDATION_REF === DELIVERY_FOUNDATION_ID &&
    runtime.matchesFoundation &&
    runtime.reusesExistingLayers &&
    runtimeModeMatches &&
    primaryExposed &&
    signalLayersCovered;

  return {
    layerId: DELIVERY_EXPOSURE_LAYER_ID,
    runtimeId: DELIVERY_RUNTIME_ID,
    foundationId: DELIVERY_FOUNDATION_ID,
    concernId,
    primaryDomain,
    exposure,
    modes: exposure.modes,
    signals,
    runtime,
    adapters: runtime.adapters,
    matchesRuntime,
    reusesExistingLayers: runtime.reusesExistingLayers,
  };
}

export function listExposedSignalIds(
  plan: DeliveryExposurePlan,
): DeliveryExposureSignalId[] {
  return plan.signals.map((s) => s.signalId);
}
