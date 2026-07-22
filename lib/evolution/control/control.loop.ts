/**
 * Evolution P7 — Autonomous Improvement Loop
 */

import { listImprovementRecords } from "../evolution.improvement";
import { listOptimizationRecommendations } from "../evolution.recommendation";
import { EVO_LOOP_STATUSES } from "./control.constants";
import { getEvolutionOrchestration } from "./control.orchestration";
import type {
  AutonomousImprovementLoop,
  EvoLoopStatus,
  RunImprovementLoopInput,
} from "./control.types";

const loops = new Map<string, AutonomousImprovementLoop>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneLoop(loop: AutonomousImprovementLoop): AutonomousImprovementLoop {
  return { ...loop, actions: [...loop.actions] };
}

export function runAutonomousImprovementLoop(
  input: RunImprovementLoopInput,
): AutonomousImprovementLoop {
  const orchestration = getEvolutionOrchestration(
    input.orchestrationId.trim(),
  );
  if (!orchestration) {
    throw new Error(
      `evolution orchestration not found: ${input.orchestrationId}`,
    );
  }

  const iterations = Math.max(1, Math.min(5, input.iterations ?? 2));
  const present = orchestration.domains.filter((d) => d.present);
  const avgScore =
    present.length === 0
      ? 0
      : present.reduce((sum, d) => sum + d.score, 0) / present.length;

  const recommendations = orchestration.operationsIntelligenceId
    ? listOptimizationRecommendations({
        intelligenceProfileId: orchestration.operationsIntelligenceId,
      })
    : [];
  const improvements = orchestration.operationsIntelligenceId
    ? listImprovementRecords({
        intelligenceProfileId: orchestration.operationsIntelligenceId,
      })
    : [];

  const actions: string[] = [];
  let improvementDelta = 0;

  for (let i = 0; i < iterations; i++) {
    const weak = present
      .filter((d) => d.score < 70)
      .sort((a, b) => a.score - b.score)[0];
    if (weak) {
      actions.push(`tune-${weak.domain.toLowerCase()}-iteration-${i + 1}`);
      improvementDelta += Math.max(2, Math.round((70 - weak.score) * 0.15));
    } else {
      actions.push(`reinforce-steady-state-iteration-${i + 1}`);
      improvementDelta += 2;
    }
  }

  if (recommendations.length > 0) {
    actions.push(`apply-optimization-recs=${recommendations.length}`);
    improvementDelta += Math.min(8, recommendations.length * 2);
  }
  if (improvements.length > 0) {
    actions.push(`track-improvements=${improvements.length}`);
    improvementDelta += 3;
  }

  let status: EvoLoopStatus = "RUNNING";
  if (avgScore >= 75 && improvementDelta >= 6) status = "CONVERGED";
  else if (avgScore < 35) status = "BLOCKED";
  if (!(EVO_LOOP_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid loop status: ${status}`);
  }

  const id = input.id?.trim() || createId("evoloop");
  if (loops.has(id)) {
    throw new Error(`autonomous improvement loop already exists: ${id}`);
  }

  const now = nowIso();
  const loop: AutonomousImprovementLoop = {
    id,
    orchestrationId: orchestration.id,
    status,
    iteration: iterations,
    improvementDelta,
    actions,
    detail: `status=${status} iterations=${iterations} delta=${improvementDelta}`,
    startedAt: now,
    updatedAt: now,
  };
  loops.set(id, loop);
  return cloneLoop(loop);
}

export function getAutonomousImprovementLoop(
  id: string,
): AutonomousImprovementLoop | undefined {
  const loop = loops.get(id.trim());
  return loop ? cloneLoop(loop) : undefined;
}

export function listAutonomousImprovementLoops(filter?: {
  orchestrationId?: string;
  status?: EvoLoopStatus;
}): AutonomousImprovementLoop[] {
  let result = [...loops.values()];
  if (filter?.orchestrationId) {
    const oid = filter.orchestrationId.trim();
    result = result.filter((l) => l.orchestrationId === oid);
  }
  if (filter?.status) result = result.filter((l) => l.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneLoop);
}

export function clearAutonomousImprovementLoops(): void {
  loops.clear();
}
