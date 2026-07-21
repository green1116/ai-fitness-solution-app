/**
 * Launch P7 — Launch Metrics
 */

import { getLatestReleaseDecision } from "./control.decision";
import { getGoNoGoResult } from "./control.gonogo";
import { getLaunchOrchestration } from "./control.orchestration";
import type { LaunchMetrics } from "./control.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function computeLaunchMetrics(orchestrationId: string): LaunchMetrics {
  const orchestration = getLaunchOrchestration(orchestrationId.trim());
  if (!orchestration) {
    throw new Error(`orchestration not found: ${orchestrationId}`);
  }

  const activeStages = orchestration.stages.filter(
    (s) => s.status !== "SKIPPED",
  );
  const stageReadyCount = activeStages.filter((s) => s.status === "READY").length;
  const stageBlockedCount = activeStages.filter(
    (s) => s.status === "BLOCKED",
  ).length;
  const stagePendingCount = activeStages.filter(
    (s) => s.status === "PENDING",
  ).length;

  const goNoGo = getGoNoGoResult(orchestration.id);
  const decision = getLatestReleaseDecision(orchestration.id);

  const denominator = activeStages.length || 1;
  const readinessScore = Math.round((stageReadyCount / denominator) * 10000) / 100;

  return {
    orchestrationId: orchestration.id,
    stageReadyCount,
    stageBlockedCount,
    stagePendingCount,
    goNoGoVerdict: goNoGo?.verdict,
    releaseVerdict: decision?.verdict,
    readinessScore,
    computedAt: nowIso(),
  };
}
