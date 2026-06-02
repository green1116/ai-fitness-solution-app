/**
 * V3.7 FINAL ??release snapshot runtime (static chain)
 */

import { baselineHashFromLayers, V37_FINAL_RELEASE_GENERATION } from "../shared";
import { buildFreezeSnapshotMeta } from "../freeze/freeze-snapshot";

export const SNAPSHOT_RUNTIME_VERSION = "3.7-final-snapshot-runtime-1" as const;

export type SnapshotChainNode = {
  id: string;
  type: "release" | "rollback" | "freeze";
  hash: string;
  generation: string;
};

export type SnapshotRuntime = {
  version: typeof SNAPSHOT_RUNTIME_VERSION;
  runtimeId: string;
  chain: SnapshotChainNode[];
  releaseSnapshotMap: Record<string, string>;
  restoreGraph: string;
  summary: string;
};

export function buildSnapshotRuntime(input?: { deploymentId?: string }): SnapshotRuntime {
  const deploymentId = input?.deploymentId ?? "snapshot-runtime";
  const runtimeId = `SNR-V37FINAL-${deploymentId.slice(0, 8)}`;
  const hash = baselineHashFromLayers();
  const freezeSnap = buildFreezeSnapshotMeta({ deploymentId });

  const chain: SnapshotChainNode[] = [
    { id: "snap-release-primary", type: "release", hash, generation: V37_FINAL_RELEASE_GENERATION },
    { id: "snap-rollback-primary", type: "rollback", hash, generation: V37_FINAL_RELEASE_GENERATION },
    { id: freezeSnap.snapshotId, type: "freeze", hash, generation: V37_FINAL_RELEASE_GENERATION },
  ];

  const releaseSnapshotMap: Record<string, string> = {
    primary: chain[0].id,
    rollback: chain[1].id,
    freeze: chain[2].id,
  };

  const restoreGraph = chain.map((n) => n.id).join(" \u2192 ");

  return {
    version: SNAPSHOT_RUNTIME_VERSION,
    runtimeId,
    chain,
    releaseSnapshotMap,
    restoreGraph,
    summary: `snapshot-runtime id=${runtimeId} chain=${chain.length} restoreGraph=${restoreGraph}`,
  };
}
