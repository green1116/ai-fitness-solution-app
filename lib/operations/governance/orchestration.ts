import { buildGovernanceActionQueue } from "./orchestration.queue";
import { buildGovernanceOrchestrationPlan } from "./orchestration.plan";
import { resolveGovernanceOrchestrationConflicts } from "./orchestration.conflict";
import { buildGovernanceOrchestrationTimeline } from "./orchestration.timeline";
import { executeGovernanceOrchestrationPlan } from "./orchestration.executor";
import { summarizeGovernanceOrchestration } from "./orchestration.summary";
import {
  GOVERNANCE_ORCHESTRATION_VERSION,
  type GovernanceOrchestrationRuntimeInput,
  type GovernanceOrchestrationRuntimeResult,
} from "./orchestration.types";

export function buildGovernanceOrchestration(
  input: GovernanceOrchestrationRuntimeInput,
): GovernanceOrchestrationRuntimeResult {
  const basePlan = buildGovernanceOrchestrationPlan(input);
  const conflicts = resolveGovernanceOrchestrationConflicts({
    plan: basePlan,
    rulebookEvaluation: input.rulebookEvaluation,
    policyPackEvaluation: input.policyPackEvaluation,
  });
  const { steps, state } = executeGovernanceOrchestrationPlan({
    plan: basePlan,
    conflicts,
  });
  const plan = { ...basePlan, steps };
  const timeline = buildGovernanceOrchestrationTimeline({
    plan,
    observedAt: input.observedAt,
    conflicts,
  });
  const suppressedIds = new Set(
    timeline.entries
      .filter((e) => e.note.includes("Suppressed by conflict"))
      .map((e) => e.stepId),
  );
  const queue = buildGovernanceActionQueue({
    plan,
    observedAt: input.observedAt,
    suppressedStepIds: suppressedIds,
  });
  const summary = summarizeGovernanceOrchestration({
    deploymentId: input.deploymentId,
    plan,
    state,
    timeline,
    conflicts,
  });

  return {
    version: GOVERNANCE_ORCHESTRATION_VERSION,
    plan,
    state,
    timeline,
    conflicts,
    queue,
    summary,
  };
}

export { GOVERNANCE_ORCHESTRATION_VERSION };
