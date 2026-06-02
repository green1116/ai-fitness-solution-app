/**
 * V3.7 FINAL ??freeze lock state
 */

import { buildFreezeIntegrityReport } from "./freeze-integrity";
import { buildProductionFreezeManifest } from "./freeze-manifest";

export const FREEZE_LOCK_VERSION = "3.7-final-freeze-lock-1" as const;

export type FreezeLockState = {
  version: typeof FREEZE_LOCK_VERSION;
  lockId: string;
  locked: boolean;
  sealApplied: boolean;
  integrityIntact: boolean;
  lockReason: string;
  summary: string;
};

export function buildFreezeLockState(input?: { deploymentId?: string }): FreezeLockState {
  const deploymentId = input?.deploymentId ?? "freeze-lock";
  const lockId = `FLK-V37FINAL-${deploymentId.slice(0, 8)}`;
  const integrity = buildFreezeIntegrityReport({ deploymentId });
  const manifest = buildProductionFreezeManifest({ deploymentId });

  const locked = manifest.integrityState === "sealed" && integrity.intact;
  const sealApplied = manifest.integrityState === "sealed";

  return {
    version: FREEZE_LOCK_VERSION,
    lockId,
    locked,
    sealApplied,
    integrityIntact: integrity.intact,
    lockReason: locked
      ? "Production freeze sealed ? baseline intact, preservation continuity verified."
      : "Freeze lock pending ? integrity or preservation continuity not satisfied.",
    summary: `freeze-lock id=${lockId} locked=${locked} seal=${sealApplied} intact=${integrity.intact}`,
  };
}
