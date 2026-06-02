import { loadGovernanceRulebook } from "./rulebook.loader";
import type {
  GovernanceOrchestrationActionType,
  GovernanceOrchestrationPlan,
  GovernanceOrchestrationRuntimeInput,
  GovernanceOrchestrationStep,
} from "./orchestration.types";
import type { GovernanceSeverityLevel } from "./types";

const ACTION_ORDER: GovernanceOrchestrationActionType[] = [
  "escalate",
  "approve",
  "manualReview",
  "applyControl",
  "recordException",
  "defer",
  "generateAudit",
];

const ACTION_BASE_PRIORITY: Record<GovernanceOrchestrationActionType, number> = {
  escalate: 100,
  approve: 80,
  manualReview: 75,
  applyControl: 60,
  recordException: 40,
  defer: 20,
  generateAudit: 10,
};

function severityForRule(ruleId: string): GovernanceSeverityLevel {
  const entry = loadGovernanceRulebook().entries.find((e) => e.ruleId === ruleId);
  if (entry) return entry.severity;
  if (ruleId.includes("strict") || ruleId.includes("emergency")) return "high";
  if (ruleId.includes("pack")) return "medium";
  return "low";
}

function buildStep(
  input: {
    action: GovernanceOrchestrationActionType;
    sourceRuleId: string;
    reason: string;
    order: number;
    autoCompletable: boolean;
  },
): GovernanceOrchestrationStep {
  const severity = severityForRule(input.sourceRuleId);
  const severityBoost =
    severity === "critical" ? 20 : severity === "high" ? 10 : severity === "medium" ? 5 : 0;
  return {
    stepId: `step-${input.action}-${input.sourceRuleId}`,
    order: input.order,
    action: input.action,
    sourceRuleId: input.sourceRuleId,
    severity,
    priority: ACTION_BASE_PRIORITY[input.action] + severityBoost,
    status: input.autoCompletable ? "pending" : "pending",
    reason: input.reason,
    autoCompletable: input.autoCompletable,
  };
}

export function buildGovernanceOrchestrationPlan(
  input: GovernanceOrchestrationRuntimeInput,
): GovernanceOrchestrationPlan {
  const { ruleEvaluation, policyPackEvaluation } = input;
  const steps: GovernanceOrchestrationStep[] = [];
  let order = 0;

  for (const ruleId of ruleEvaluation.triggeredEscalations) {
    steps.push(
      buildStep({
        action: "escalate",
        sourceRuleId: ruleId,
        reason: `Escalation required by rule ${ruleId}.`,
        order: order++,
        autoCompletable: false,
      }),
    );
  }

  for (const ruleId of ruleEvaluation.triggeredApprovals) {
    const isManualReview =
      ruleId.includes("review") ||
      ruleId.includes("low-confidence") ||
      ruleId.includes("strict");
    steps.push(
      buildStep({
        action: isManualReview ? "manualReview" : "approve",
        sourceRuleId: ruleId,
        reason: isManualReview
          ? `Manual review required by rule ${ruleId}.`
          : `Approval required by rule ${ruleId}.`,
        order: order++,
        autoCompletable: false,
      }),
    );
  }

  for (const ruleId of ruleEvaluation.triggeredControls) {
    steps.push(
      buildStep({
        action: "applyControl",
        sourceRuleId: ruleId,
        reason: `Control application required by rule ${ruleId}.`,
        order: order++,
        autoCompletable: true,
      }),
    );
  }

  for (const ruleId of ruleEvaluation.triggeredExceptions) {
    steps.push(
      buildStep({
        action: "recordException",
        sourceRuleId: ruleId,
        reason: `Exception recording required by rule ${ruleId}.`,
        order: order++,
        autoCompletable: true,
      }),
    );
  }

  for (const override of policyPackEvaluation.overrides) {
    if (override.action === "defer") {
      steps.push(
        buildStep({
          action: "defer",
          sourceRuleId: override.ruleId ?? override.overrideId,
          reason: override.reason,
          order: order++,
          autoCompletable: true,
        }),
      );
    }
    if (override.target === "audit" || override.action === "record") {
      steps.push(
        buildStep({
          action: "generateAudit",
          sourceRuleId: override.ruleId ?? override.overrideId,
          reason: override.reason,
          order: order++,
          autoCompletable: true,
        }),
      );
    }
  }

  if (steps.length === 0) {
    steps.push(
      buildStep({
        action: "generateAudit",
        sourceRuleId: "orchestration-baseline",
        reason: "Baseline governance audit for matched rulebook posture.",
        order: order++,
        autoCompletable: true,
      }),
    );
  } else {
    steps.push(
      buildStep({
        action: "generateAudit",
        sourceRuleId: "orchestration-final-audit",
        reason: "Final audit after governance action sequence.",
        order: order++,
        autoCompletable: true,
      }),
    );
  }

  const sorted = [...steps].sort((a, b) => {
    const actionDiff = ACTION_BASE_PRIORITY[b.action] - ACTION_BASE_PRIORITY[a.action];
    if (actionDiff !== 0) return actionDiff;
    return b.priority - a.priority;
  });

  const reindexed = sorted.map((step, idx) => ({ ...step, order: idx }));

  return {
    planId: `gplan-${input.deploymentId.slice(0, 12)}`,
    deploymentId: input.deploymentId,
    policyPackMode: input.policyPackMode,
    steps: reindexed,
    executionOrder: ACTION_ORDER,
  };
}
