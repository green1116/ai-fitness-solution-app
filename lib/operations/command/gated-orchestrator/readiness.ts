import type { CommandPlatformStack } from "../api/stack";
import type { OrchestrationMode, OrchestrationReadinessProfile } from "./types";

export function evaluateOrchestrationReadiness(input: {
  deploymentId: string;
  intentId: string;
  stack: CommandPlatformStack;
  mode: OrchestrationMode;
  admitted: boolean;
}): OrchestrationReadinessProfile {
  const profile = input.stack.coordination.eligibilityProfiles.find(
    (p) => p.intentId === input.intentId,
  );
  const readiness = input.stack.coordination.dispatchReadiness.find(
    (r) => r.intentId === input.intentId,
  );
  const plan = input.stack.bridge.plans.find((p) => p.intentId === input.intentId);
  const rollback = input.stack.bridge.rollbackReadiness.find(
    (r) => r.intentId === input.intentId,
  );

  const hitlCleared = input.stack.hitl.bridgeEligibleIntentIds.includes(input.intentId);
  const bridgePlanReady = !!plan;
  const dispatchReady = readiness?.status === "ready";
  const rollbackCapable = rollback?.capable ?? false;

  let liveReady = input.admitted && hitlCleared && dispatchReady;
  if (input.mode === "dry-run" || input.mode === "orchestration-only") {
    liveReady = input.admitted && hitlCleared && bridgePlanReady;
  }
  if (input.mode === "rollback-aware") {
    liveReady = liveReady && rollbackCapable;
  }

  return {
    profileId: `orch-readiness-${input.intentId}`,
    intentId: input.intentId,
    admitted: input.admitted,
    hitlCleared,
    bridgePlanReady,
    dispatchReady: dispatchReady ?? false,
    rollbackCapable,
    liveReady,
    detail: `admitted=${input.admitted} dispatch=${readiness?.status ?? "n/a"} rollback=${rollbackCapable}`,
  };
}

export function evaluateOrchestrationReadinessBatch(input: {
  deploymentId: string;
  stack: CommandPlatformStack;
  mode: OrchestrationMode;
  admittedIntentIds: string[];
}): OrchestrationReadinessProfile[] {
  return input.stack.command.intents.map((intent) =>
    evaluateOrchestrationReadiness({
      deploymentId: input.deploymentId,
      intentId: intent.intentId,
      stack: input.stack,
      mode: input.mode,
      admitted: input.admittedIntentIds.includes(intent.intentId),
    }),
  );
}
