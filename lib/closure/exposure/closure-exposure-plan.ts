/**
 * PI-8.4 — Compose closure exposure with PI-8.3 runtime.
 * Does not invoke FE/BE/Data/Integration/Delivery/Implementation modules.
 */
import { CLOSURE_FOUNDATION_ID } from "../foundation/closure.constants";
import type { ClosureDomainId } from "../foundation/layer-refs";
import type { ClosurePackageId } from "../foundation/package-refs";
import { CLOSURE_RUNTIME_ID } from "../runtime/runtime.constants";
import {
  resolveClosureRuntimePlan,
  type ClosureRuntimePlan,
} from "../runtime/closure-runtime-plan";
import type { ClosureRuntimeAdapter } from "../runtime/layer-runtime-bindings";
import {
  CLOSURE_EVIDENCE_EXPOSURE_BINDINGS,
  type ClosureEvidenceExposureBinding,
  type ClosureExposureSignalId,
} from "./evidence-exposure-bindings";
import {
  CLOSURE_EXPOSURE_LAYER_ID,
  CLOSURE_FOUNDATION_REF,
  CLOSURE_RUNTIME_REF,
} from "./exposure.constants";
import {
  getClosurePackageExposure,
  type ClosureExposureMode,
  type ClosurePackageExposure,
} from "./package-exposure";

export type ClosureExposurePlan = Readonly<{
  layerId: typeof CLOSURE_EXPOSURE_LAYER_ID;
  runtimeId: typeof CLOSURE_RUNTIME_ID;
  foundationId: typeof CLOSURE_FOUNDATION_ID;
  packageId: ClosurePackageId;
  primaryDomain: ClosureDomainId | null;
  exposure: ClosurePackageExposure;
  modes: readonly ClosureExposureMode[];
  signals: readonly ClosureEvidenceExposureBinding[];
  runtime: ClosureRuntimePlan;
  adapters: readonly ClosureRuntimeAdapter[];
  matchesRuntime: boolean;
  reusesExistingLayers: boolean;
  reusesExistingDomains: boolean;
}>;

/**
 * Bind a package (+ Domain) to exposure modes + runtime plan.
 */
export function resolveClosureExposurePlan(
  packageId: ClosurePackageId,
  primaryDomain: ClosureDomainId | null = null,
): ClosureExposurePlan {
  const exposure = getClosurePackageExposure(packageId);
  if (!exposure) {
    throw new Error(`Unknown closure package exposure: ${packageId}`);
  }

  const runtime = resolveClosureRuntimePlan(packageId, primaryDomain);

  const signals = exposure.signalIds.map((id) => {
    const row = CLOSURE_EVIDENCE_EXPOSURE_BINDINGS.find(
      (s) => s.signalId === id,
    );
    if (!row) throw new Error(`Unknown closure evidence exposure: ${id}`);
    return row;
  });

  const runtimeModeMatches = exposure.runtimeMode === runtime.mode;

  const signalLayersCovered = signals.every((signal) =>
    signal.layerIds.every((layerId) => {
      if (runtime.adapters.some((a) => a.layerId === layerId)) {
        return true;
      }
      return signal.packageId === "CROSS";
    }),
  );

  const primaryExposed = runtime.adapters.some(
    (a) => a.layerId === exposure.primaryLayerId,
  );

  const matchesRuntime =
    runtime.runtimeId === CLOSURE_RUNTIME_ID &&
    CLOSURE_RUNTIME_REF === CLOSURE_RUNTIME_ID &&
    CLOSURE_FOUNDATION_REF === CLOSURE_FOUNDATION_ID &&
    runtime.matchesRouting &&
    runtime.reusesExistingLayers &&
    runtime.reusesExistingDomains &&
    runtimeModeMatches &&
    primaryExposed &&
    signalLayersCovered;

  return {
    layerId: CLOSURE_EXPOSURE_LAYER_ID,
    runtimeId: CLOSURE_RUNTIME_ID,
    foundationId: CLOSURE_FOUNDATION_ID,
    packageId,
    primaryDomain,
    exposure,
    modes: exposure.modes,
    signals,
    runtime,
    adapters: runtime.adapters,
    matchesRuntime,
    reusesExistingLayers: runtime.reusesExistingLayers,
    reusesExistingDomains: runtime.reusesExistingDomains,
  };
}

export function listClosureExposedSignalIds(
  plan: ClosureExposurePlan,
): ClosureExposureSignalId[] {
  return plan.signals.map((s) => s.signalId);
}
