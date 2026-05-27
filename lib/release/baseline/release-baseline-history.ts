/**
 * V3.7 FINAL ??release baseline history & lineage
 */

import { V37_FINAL_RELEASE_GENERATION } from "../shared";
import { buildFreezeReleaseDescriptor } from "../freeze/freeze-release";

export const RELEASE_BASELINE_HISTORY_VERSION = "3.7-final-baseline-history-1" as const;

export type BaselineHistoryNode = {
  id: string;
  generation: string;
  order: number;
  phase: string;
};

export type ReleaseBaselineHistory = {
  version: typeof RELEASE_BASELINE_HISTORY_VERSION;
  historyId: string;
  lineage: BaselineHistoryNode[];
  chronology: string[];
  evolutionGraph: string;
  freezeContinuity: boolean;
  summary: string;
};

export function buildReleaseBaselineHistory(input?: { deploymentId?: string }): ReleaseBaselineHistory {
  const deploymentId = input?.deploymentId ?? "baseline-history";
  const historyId = `RBH-V37FINAL-${deploymentId.slice(0, 8)}`;
  const release = buildFreezeReleaseDescriptor({ deploymentId });

  const lineage: BaselineHistoryNode[] = release.entries.map((entry, index) => ({
    id: entry.id,
    generation: entry.generation,
    order: index + 1,
    phase: entry.phase,
  }));

  const evolutionGraph = lineage.map((n) => `${n.order}:${n.id}`).join(" \u2192 ");

  return {
    version: RELEASE_BASELINE_HISTORY_VERSION,
    historyId,
    lineage,
    chronology: release.chronology,
    evolutionGraph,
    freezeContinuity: true,
    summary: `baseline-history id=${historyId} nodes=${lineage.length} continuity=true graph=${evolutionGraph.slice(0, 80)}`,
  };
}
