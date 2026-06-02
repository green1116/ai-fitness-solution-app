import type { GovernanceOrchestrationConflict, GovernanceOrchestrationPlan } from "./orchestration.types";
import type { GovernanceRulebookEvaluation } from "./rulebook.types";
import type { GovernancePolicyPackEvaluation } from "./policy-pack.types";

const CONFLICT_PRIORITY: Record<string, number> = {
  escalate: 100,
  approve: 80,
  manualReview: 75,
  applyControl: 60,
  recordException: 40,
  defer: 20,
  generateAudit: 10,
};

function winnerAction(
  a: GovernanceOrchestrationConflict["actionA"],
  b: GovernanceOrchestrationConflict["actionB"],
): GovernanceOrchestrationConflict["winner"] {
  return (CONFLICT_PRIORITY[a] ?? 0) >= (CONFLICT_PRIORITY[b] ?? 0) ? a : b;
}

export function resolveGovernanceOrchestrationConflicts(input: {
  plan: GovernanceOrchestrationPlan;
  rulebookEvaluation: GovernanceRulebookEvaluation;
  policyPackEvaluation: GovernancePolicyPackEvaluation;
}): GovernanceOrchestrationConflict[] {
  const conflicts: GovernanceOrchestrationConflict[] = [];
  const stepsByRule = new Map<string, typeof input.plan.steps>();

  for (const step of input.plan.steps) {
    const list = stepsByRule.get(step.sourceRuleId) ?? [];
    list.push(step);
    stepsByRule.set(step.sourceRuleId, list);
  }

  for (const [ruleId, ruleSteps] of stepsByRule) {
    const actions = ruleSteps.map((s) => s.action);
    if (actions.includes("defer") && (actions.includes("approve") || actions.includes("manualReview"))) {
      const winner = winnerAction("approve", "defer");
      conflicts.push({
        conflictId: `conflict-${ruleId}-defer-approval`,
        actionA: "approve",
        actionB: "defer",
        sourceRuleIds: [ruleId],
        resolution: "Approval requirement takes precedence over deferral.",
        winner,
      });
    }
    if (actions.includes("escalate") && actions.includes("applyControl")) {
      conflicts.push({
        conflictId: `conflict-${ruleId}-escalation-control`,
        actionA: "escalate",
        actionB: "applyControl",
        sourceRuleIds: [ruleId],
        resolution: "Escalation executes before control application.",
        winner: "escalate",
      });
    }
  }

  for (const resolution of input.rulebookEvaluation.conflictResolutions) {
    conflicts.push({
      conflictId: `conflict-rulebook-${resolution.actionTarget}`,
      actionA: "escalate",
      actionB: "approve",
      sourceRuleIds: [resolution.winningRuleId, ...resolution.suppressedRuleIds],
      resolution: resolution.reason,
      winner: resolution.actionTarget === "escalation" ? "escalate" : "approve",
    });
  }

  for (const override of input.policyPackEvaluation.overrides) {
    if (override.action === "defer" && override.target === "approval") {
      conflicts.push({
        conflictId: `conflict-pack-${override.overrideId}`,
        actionA: "approve",
        actionB: "defer",
        sourceRuleIds: override.ruleId ? [override.ruleId] : [],
        resolution: override.reason,
        winner: "approve",
      });
    }
  }

  if (input.policyPackEvaluation.mode === "strict") {
    const hasDefer = input.plan.steps.some((s) => s.action === "defer");
    const hasApproval = input.plan.steps.some(
      (s) => s.action === "approve" || s.action === "manualReview",
    );
    if (hasDefer && hasApproval) {
      conflicts.push({
        conflictId: "conflict-strict-mode-priority",
        actionA: "manualReview",
        actionB: "defer",
        sourceRuleIds: [],
        resolution: "Strict policy pack: manual review cannot be masked by defer.",
        winner: "manualReview",
      });
    }
  }

  return conflicts;
}
