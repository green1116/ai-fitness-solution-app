/**
 * V64 P8 — Unified commercial freeze entry
 */
import { buildCommercialFreezeManifest } from "./freeze.manifest";
import type { CommercialFreezeManifest } from "./freeze.types";

export function runCommercialFreeze(input?: {
  deploymentId?: string;
}): CommercialFreezeManifest {
  return buildCommercialFreezeManifest(input);
}

export function assertCommercialFreezePass(input?: {
  deploymentId?: string;
}): CommercialFreezeManifest {
  const manifest = runCommercialFreeze(input);
  if (!manifest.frozen) {
    throw new Error(
      `V64 commercial freeze failed: frozen=${manifest.frozen} versionLock=${manifest.versionLockOk} verification=${manifest.verification.verificationOk}`,
    );
  }
  return manifest;
}
