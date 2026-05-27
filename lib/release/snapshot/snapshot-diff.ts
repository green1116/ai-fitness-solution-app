/**
 * V3.7 FINAL —snapshot drift diff
 */

import { baselineHashFromLayers } from "../shared";
import { buildSnapshotRuntime } from "./snapshot-runtime";

export const SNAPSHOT_DIFF_VERSION = "3.7-final-snapshot-diff-1" as const;

export type SnapshotDriftDiff = {
  version: typeof SNAPSHOT_DIFF_VERSION;
  diffId: string;
  currentHash: string;
  expectedHash: string;
  driftDetected: boolean;
  chainLength: number;
  summary: string;
};

export function buildSnapshotDriftDiff(input?: { deploymentId?: string }): SnapshotDriftDiff {
  const deploymentId = input?.deploymentId ?? "snapshot-diff";
  const diffId = `SND-V37FINAL-${deploymentId.slice(0, 8)}`;
  const runtime = buildSnapshotRuntime({ deploymentId });
  const currentHash = baselineHashFromLayers();
  const expectedHash = runtime.chain[0]?.hash ?? currentHash;
  const driftDetected = currentHash !== expectedHash;

  return {
    version: SNAPSHOT_DIFF_VERSION,
    diffId,
    currentHash,
    expectedHash,
    driftDetected,
    chainLength: runtime.chain.length,
    summary: `snapshot-diff id=${diffId} drift=${driftDetected} chain=${runtime.chain.length}`,
  };
}
