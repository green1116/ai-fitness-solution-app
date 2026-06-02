/**
 * V3.7 FINAL —production freeze manifest
 */

import {
  V37_COMPATIBILITY_WINDOW,
  V37_FINAL_RELEASE_GENERATION,
  V37_RESTORATION_WINDOW,
  baselineHashFromLayers,
  isBuildFreezeIntact,
} from "../shared";
import { BUILD_FREEZE_MANIFEST } from "../../commercialization/stabilization/build-freeze";

export const PRODUCTION_FREEZE_MANIFEST_VERSION = "3.7-final-freeze-manifest-1" as const;

export type IntegrityState = "sealed" | "drift" | "open";

export type ProductionFreezeManifest = {
  version: typeof PRODUCTION_FREEZE_MANIFEST_VERSION;
  freezeId: string;
  freezeVersion: string;
  baselineHash: string;
  baselineTimestamp: string;
  releaseGeneration: typeof V37_FINAL_RELEASE_GENERATION;
  integrityState: IntegrityState;
  compatibilityWindow: typeof V37_COMPATIBILITY_WINDOW;
  restorationWindow: typeof V37_RESTORATION_WINDOW;
  summary: string;
};

export function buildProductionFreezeManifest(input?: { deploymentId?: string }): ProductionFreezeManifest {
  const deploymentId = input?.deploymentId ?? "production-freeze";
  const freezeId = `FRZ-V37FINAL-${deploymentId.slice(0, 8)}`;
  const intact = isBuildFreezeIntact();
  const integrityState: IntegrityState = intact ? "sealed" : BUILD_FREEZE_MANIFEST.buildPassed ? "drift" : "open";

  return {
    version: PRODUCTION_FREEZE_MANIFEST_VERSION,
    freezeId,
    freezeVersion: "3.7-final-freeze-1",
    baselineHash: baselineHashFromLayers(),
    baselineTimestamp: BUILD_FREEZE_MANIFEST.verifiedAt,
    releaseGeneration: V37_FINAL_RELEASE_GENERATION,
    integrityState,
    compatibilityWindow: V37_COMPATIBILITY_WINDOW,
    restorationWindow: V37_RESTORATION_WINDOW,
    summary: `production-freeze-manifest id=${freezeId} integrity=${integrityState} hash=${baselineHashFromLayers()} generation=${V37_FINAL_RELEASE_GENERATION}`,
  };
}
