/**
 * PI-7.4 — Compose implementation exposure with PI-7.3 runtime.
 * Does not invoke FE/BE/Data/Integration/Delivery modules.
 */
import { IMPLEMENTATION_FOUNDATION_ID } from "../foundation/implementation.constants";
import type { ImplementationDomainId } from "../foundation/layer-refs";
import type { ImplementationPackageId } from "../foundation/package-refs";
import { IMPLEMENTATION_RUNTIME_ID } from "../runtime/runtime.constants";
import {
  resolveImplementationRuntimePlan,
  type ImplementationRuntimePlan,
} from "../runtime/implementation-runtime-plan";
import type { ImplementationRuntimeAdapter } from "../runtime/layer-runtime-bindings";
import {
  EVIDENCE_EXPOSURE_BINDINGS,
  type EvidenceExposureBinding,
  type ImplementationExposureSignalId,
} from "./evidence-exposure-bindings";
import {
  IMPLEMENTATION_EXPOSURE_LAYER_ID,
  IMPLEMENTATION_FOUNDATION_REF,
  IMPLEMENTATION_RUNTIME_REF,
} from "./exposure.constants";
import {
  getPackageExposure,
  type ImplementationExposureMode,
  type PackageExposure,
} from "./package-exposure";

export type ImplementationExposurePlan = Readonly<{
  layerId: typeof IMPLEMENTATION_EXPOSURE_LAYER_ID;
  runtimeId: typeof IMPLEMENTATION_RUNTIME_ID;
  foundationId: typeof IMPLEMENTATION_FOUNDATION_ID;
  packageId: ImplementationPackageId;
  primaryDomain: ImplementationDomainId | null;
  exposure: PackageExposure;
  modes: readonly ImplementationExposureMode[];
  signals: readonly EvidenceExposureBinding[];
  runtime: ImplementationRuntimePlan;
  adapters: readonly ImplementationRuntimeAdapter[];
  matchesRuntime: boolean;
  reusesExistingLayers: boolean;
}>;

/**
 * Bind a package (+ Domain) to exposure modes + runtime plan.
 */
export function resolveImplementationExposurePlan(
  packageId: ImplementationPackageId,
  primaryDomain: ImplementationDomainId | null = null,
): ImplementationExposurePlan {
  const exposure = getPackageExposure(packageId);
  if (!exposure) {
    throw new Error(`Unknown package exposure: ${packageId}`);
  }

  const runtime = resolveImplementationRuntimePlan(packageId, primaryDomain);

  const signals = exposure.signalIds.map((id) => {
    const row = EVIDENCE_EXPOSURE_BINDINGS.find((s) => s.signalId === id);
    if (!row) throw new Error(`Unknown evidence exposure: ${id}`);
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
    runtime.runtimeId === IMPLEMENTATION_RUNTIME_ID &&
    IMPLEMENTATION_RUNTIME_REF === IMPLEMENTATION_RUNTIME_ID &&
    IMPLEMENTATION_FOUNDATION_REF === IMPLEMENTATION_FOUNDATION_ID &&
    runtime.matchesRouting &&
    runtime.reusesExistingLayers &&
    runtimeModeMatches &&
    primaryExposed &&
    signalLayersCovered;

  return {
    layerId: IMPLEMENTATION_EXPOSURE_LAYER_ID,
    runtimeId: IMPLEMENTATION_RUNTIME_ID,
    foundationId: IMPLEMENTATION_FOUNDATION_ID,
    packageId,
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
  plan: ImplementationExposurePlan,
): ImplementationExposureSignalId[] {
  return plan.signals.map((s) => s.signalId);
}
