/**
 * V65 P7 — Unified production freeze entry
 */
import { buildProductionFreezeManifest } from "./freeze.manifest";
import type { ProductionFreezeManifest } from "./freeze.types";
import type { ReleaseGateSignals } from "./release.types";

export function runProductionFreeze(input?: {
  deploymentId?: string;
  signals?: ReleaseGateSignals;
}): ProductionFreezeManifest {
  return buildProductionFreezeManifest(input);
}

export function assertProductionFreezePass(input?: {
  deploymentId?: string;
  signals?: ReleaseGateSignals;
}): ProductionFreezeManifest {
  const manifest = runProductionFreeze(input);
  if (!manifest.frozen) {
    throw new Error(
      `V65 production freeze failed: frozen=${manifest.frozen} releaseReady=${manifest.releaseReady.releaseReady} versionLock=${manifest.versionLockOk}`,
    );
  }
  return manifest;
}
