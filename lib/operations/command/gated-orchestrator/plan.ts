import type { CommandPlatformStack } from "../api/stack";
import type {
  OrchestrationDecision,
  OrchestrationMode,
  OrchestrationPlan,
  OrchestrationStep,
} from "./types";

function stepStatusForIntent(input: {
  admitted: boolean;
  readinessLiveReady: boolean;
  dispatched: boolean;
  mode: OrchestrationMode;
}): OrchestrationStep["status"] {
  if (!input.admitted) return "blocked";
  if (input.dispatched && input.mode === "live-ready") return "dispatched";
  if (input.readinessLiveReady && input.mode === "live-ready") return "ready";
  if (input.admitted && (input.mode === "dry-run" || input.mode === "orchestration-only")) return "gated";
  if (input.admitted) return "planned";
  return "skipped";
}

export function buildOrchestrationPlan(input: {
  deploymentId: string;
  stack: CommandPlatformStack;
  mode: OrchestrationMode;
  admittedIntentIds: string[];
  blockedIntentIds: string[];
  readinessByIntent: Map<string, boolean>;
  dispatchedIntentIds: string[];
}): OrchestrationPlan {
  const steps: OrchestrationStep[] = input.stack.command.intents.map((intent, sequence) => {
    const admitted = input.admittedIntentIds.includes(intent.intentId);
    const liveReady = input.readinessByIntent.get(intent.intentId) ?? false;
    const dispatched = input.dispatchedIntentIds.includes(intent.intentId);

    return {
      stepId: `orch-step-${intent.intentId}`,
      intentId: intent.intentId,
      sequence,
      domain: intent.domain,
      status: stepStatusForIntent({
        admitted,
        readinessLiveReady: liveReady,
        dispatched,
        mode: input.mode,
      }),
      mode: input.mode,
      detail: admitted ? `gated-${input.mode}` : "blocked-by-admission",
    };
  });

  return {
    planId: `orchestration-plan-${input.deploymentId}`,
    deploymentId: input.deploymentId,
    mode: input.mode,
    admittedIntentIds: input.admittedIntentIds,
    blockedIntentIds: input.blockedIntentIds,
    steps,
    rollbackAware: input.mode === "rollback-aware",
  };
}

export function buildOrchestrationDecisions(input: {
  stack: CommandPlatformStack;
  admittedIntentIds: string[];
  blockedIntentIds: string[];
}): OrchestrationDecision[] {
  const now = new Date().toISOString();
  const gateState = input.stack.coordination.gate.state;

  const decisions: OrchestrationDecision[] = [];

  for (const intentId of input.admittedIntentIds) {
    decisions.push({
      decisionId: `orch-decision-admit-${intentId}`,
      intentId,
      outcome: "proceed",
      reason: "gate-admitted",
      gateState,
      timestamp: now,
    });
  }

  for (const intentId of input.blockedIntentIds) {
    const profile = input.stack.coordination.eligibilityProfiles.find((p) => p.intentId === intentId);
    decisions.push({
      decisionId: `orch-decision-block-${intentId}`,
      intentId,
      outcome: "block",
      reason: profile?.reason ?? "not-admitted",
      gateState,
      timestamp: now,
    });
  }

  return decisions;
}
