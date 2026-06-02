/**
 * V3.7 FINAL —freeze snapshot metadata
 */

import { baselineHashFromLayers } from "../shared";
import { buildProductionFreezeManifest } from "./freeze-manifest";

export const FREEZE_SNAPSHOT_VERSION = "3.7-final-freeze-snapshot-1" as const;

export type FreezeSnapshotMeta = {
  version: typeof FREEZE_SNAPSHOT_VERSION;
  snapshotId: string;
  freezeId: string;
  baselineHash: string;
  capturedAt: string;
  sealed: boolean;
  summary: string;
};

export function buildFreezeSnapshotMeta(input?: { deploymentId?: string }): FreezeSnapshotMeta {
  const deploymentId = input?.deploymentId ?? "freeze-snapshot";
  const snapshotId = `FSN-V37FINAL-${deploymentId.slice(0, 8)}`;
  const manifest = buildProductionFreezeManifest({ deploymentId });

  return {
    version: FREEZE_SNAPSHOT_VERSION,
    snapshotId,
    freezeId: manifest.freezeId,
    baselineHash: baselineHashFromLayers(),
    capturedAt: manifest.baselineTimestamp,
    sealed: manifest.integrityState === "sealed",
    summary: `freeze-snapshot id=${snapshotId} freeze=${manifest.freezeId} sealed=${manifest.integrityState === "sealed"}`,
  };
}
