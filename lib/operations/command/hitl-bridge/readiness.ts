import type { AutonomousCommandExecutionRuntimeResult } from "../bridge/types";
import type {
  BridgeAdmissionDecision,
  BridgeEligibilityProfile,
  DispatchReadiness,
  DispatchReadinessStatus,
} from "./types";

export function evaluateDispatchReadiness(input: {
  deploymentId: string;
  profile: BridgeEligibilityProfile;
  admission: BridgeAdmissionDecision;
  bridge?: AutonomousCommandExecutionRuntimeResult;
}): DispatchReadiness {
  let status: DispatchReadinessStatus = "not-ready";
  let bridgePlanReady = false;
  let detail = "hitl-not-cleared";

  if (input.admission.outcome === "block") {
    status = "blocked";
    detail = `blocked:${input.admission.reason}`;
  } else if (input.profile.eligible && input.admission.outcome === "admit") {
    if (input.bridge) {
      const hasPlan = input.bridge.plans.some((p) => p.intentId === input.profile.intentId);
      const dispatched = input.bridge.dispatchedCommands.includes(input.profile.intentId);
      bridgePlanReady = hasPlan;
      if (dispatched) {
        status = "ready";
        detail = "bridge-dispatched";
      } else if (hasPlan) {
        status = "partial";
        detail = "bridge-plan-ready-awaiting-dispatch";
      } else {
        status = "partial";
        detail = "admitted-awaiting-bridge-plan";
      }
    } else {
      status = "ready";
      detail = "admitted-no-bridge-snapshot";
      bridgePlanReady = false;
    }
  }

  return {
    readinessId: `readiness-${input.profile.intentId}`,
    intentId: input.profile.intentId,
    status,
    bridgePlanReady,
    hitlCleared: input.profile.hitlCleared,
    detail,
  };
}

export function evaluateDispatchReadinessBatch(input: {
  deploymentId: string;
  profiles: BridgeEligibilityProfile[];
  admissions: BridgeAdmissionDecision[];
  bridge?: AutonomousCommandExecutionRuntimeResult;
}): DispatchReadiness[] {
  return input.profiles.map((profile) => {
    const admission =
      input.admissions.find((a) => a.intentId === profile.intentId) ??
      ({
        decisionId: `block-${profile.intentId}`,
        intentId: profile.intentId,
        outcome: "block",
        reason: profile.reason,
        operator: "admission-controller",
        timestamp: new Date().toISOString(),
      } as BridgeAdmissionDecision);

    return evaluateDispatchReadiness({
      deploymentId: input.deploymentId,
      profile,
      admission,
      bridge: input.bridge,
    });
  });
}
