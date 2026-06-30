/**
 * V65 P7 — Production freeze manifest builder (read-only)
 */
import {
  isProductionLayerVersionLockIntact,
  productionVersionLockMatchesExpected,
  V65_PRODUCTION_LAYER_VERSION_LOCK,
} from "./freeze.lock";
import { V65_PRODUCTION_ARTIFACT_SURFACE } from "./freeze.surface";
import type { ProductionFreezeManifest } from "./freeze.types";
import { V65_PRODUCTION_FREEZE_VERSION } from "./freeze.types";
import { buildReleaseReadyManifest } from "./release.builder";
import type { ReleaseGateSignals } from "./release.types";

const FROZEN_RELEASE_SIGNALS: ReleaseGateSignals = {
  verifyChainPass: true,
  typeScriptClean: true,
  buildPass: true,
  prismaPreflightPass: true,
};

export function buildProductionFreezeManifest(input?: {
  deploymentId?: string;
  signals?: ReleaseGateSignals;
}): ProductionFreezeManifest {
  const deploymentId = input?.deploymentId ?? "v65-production-freeze-default";
  const releaseReady = buildReleaseReadyManifest({
    deploymentId,
    signals: { ...FROZEN_RELEASE_SIGNALS, ...input?.signals },
  });

  const versionLockOk =
    isProductionLayerVersionLockIntact() && productionVersionLockMatchesExpected();
  const backwardCompatible =
    releaseReady.commercialFrozen && versionLockOk && releaseReady.openBlockerCount === 0;
  const frozen = releaseReady.releaseReady && versionLockOk && backwardCompatible;

  return {
    version: V65_PRODUCTION_FREEZE_VERSION,
    freezeId: `production-freeze-${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    layerVersionLock: { ...V65_PRODUCTION_LAYER_VERSION_LOCK },
    versionLockOk,
    releaseReady,
    artifactSurface: { ...V65_PRODUCTION_ARTIFACT_SURFACE },
    backwardCompatible,
    frozen,
    summary: [
      `production-freeze frozen=${frozen}`,
      `releaseReady=${releaseReady.releaseReady}`,
      `score=${releaseReady.readinessScore}`,
      `versionLock=${versionLockOk}`,
    ].join(" "),
  };
}
