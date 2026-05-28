import type { GovernanceIncidentRecoveryProfileRenderingPolicyResult } from "./incident-recovery-profile-rendering-policy.types";

export function buildIncidentRecoveryProfileRenderingPolicyTrace(input: {
  deploymentId: string;
  mode: GovernanceIncidentRecoveryProfileRenderingPolicyResult["mode"];
  actions: string[];
}): GovernanceIncidentRecoveryProfileRenderingPolicyResult["trace"] {
  return {
    traceId: `incident-profile-rendering-policy-trace-${input.deploymentId}`,
    selectedMode: input.mode,
    actions: input.actions,
  };
}
