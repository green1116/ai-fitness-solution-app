import type { BridgeAdmissionDecision, BridgeEligibilityProfile, EligibilityReason } from "./types";

export function admitToExecutionBridge(input: {
  deploymentId: string;
  profile: BridgeEligibilityProfile;
  operator?: string;
}): BridgeAdmissionDecision {
  return {
    decisionId: `admit-${input.profile.intentId}`,
    intentId: input.profile.intentId,
    outcome: "admit",
    reason: input.profile.reason,
    operator: input.operator ?? "admission-controller",
    timestamp: new Date().toISOString(),
  };
}

export function blockFromExecutionBridge(input: {
  deploymentId: string;
  profile: BridgeEligibilityProfile;
  operator?: string;
  reason?: EligibilityReason;
}): BridgeAdmissionDecision {
  return {
    decisionId: `block-${input.profile.intentId}`,
    intentId: input.profile.intentId,
    outcome: "block",
    reason: input.reason ?? input.profile.reason,
    operator: input.operator ?? "admission-controller",
    timestamp: new Date().toISOString(),
  };
}

export function resolveAdmissionDecisions(input: {
  deploymentId: string;
  profiles: BridgeEligibilityProfile[];
  operator?: string;
}): BridgeAdmissionDecision[] {
  return input.profiles.map((profile) =>
    profile.eligible
      ? admitToExecutionBridge({
          deploymentId: input.deploymentId,
          profile,
          operator: input.operator,
        })
      : blockFromExecutionBridge({
          deploymentId: input.deploymentId,
          profile,
          operator: input.operator,
        }),
  );
}
