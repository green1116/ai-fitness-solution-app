/**
 * V64 P8 — Commercial freeze manifest builder (read-only)
 */
import { V64_COMMERCIAL_LAYER_VERSION_LOCK, isCommercialLayerVersionLockIntact } from "./freeze.lock";
import type { CommercialFreezeManifest } from "./freeze.types";
import { V64_COMMERCIAL_FREEZE_VERSION } from "./freeze.types";
import { buildCommercialVerificationReport } from "./verify.builder";
import { EXPECTED_LAYER_VERSIONS } from "./verify.versions";

function versionLockMatchesExpected(): boolean {
  const lock = V64_COMMERCIAL_LAYER_VERSION_LOCK;
  return (
    lock.foundation === EXPECTED_LAYER_VERSIONS.foundation &&
    lock.pricing === EXPECTED_LAYER_VERSIONS.pricing &&
    lock.featureMatrix === EXPECTED_LAYER_VERSIONS.featureMatrix &&
    lock.capability === EXPECTED_LAYER_VERSIONS.capability &&
    lock.catalog === EXPECTED_LAYER_VERSIONS.catalog &&
    lock.transition === EXPECTED_LAYER_VERSIONS.transition &&
    lock.verify === EXPECTED_LAYER_VERSIONS.verify &&
    lock.packaging === EXPECTED_LAYER_VERSIONS.packaging
  );
}

export function buildCommercialFreezeManifest(input?: {
  deploymentId?: string;
}): CommercialFreezeManifest {
  const deploymentId = input?.deploymentId ?? "v64-commercial-freeze-default";
  const verification = buildCommercialVerificationReport({ deploymentId });
  const versionLockOk = isCommercialLayerVersionLockIntact() && versionLockMatchesExpected();
  const backwardCompatible = verification.backwardCompatible && versionLockOk;
  const frozen = verification.verificationOk && versionLockOk && backwardCompatible;

  return {
    version: V64_COMMERCIAL_FREEZE_VERSION,
    freezeId: `commercial-freeze-${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    layerVersionLock: { ...V64_COMMERCIAL_LAYER_VERSION_LOCK },
    versionLockOk,
    verification,
    backwardCompatible,
    frozen,
    summary: [
      `commercial-freeze frozen=${frozen}`,
      `layers=${verification.layers.filter((l) => l.ok).length}/${verification.layers.length}`,
      `versionLock=${versionLockOk}`,
    ].join(" "),
  };
}
