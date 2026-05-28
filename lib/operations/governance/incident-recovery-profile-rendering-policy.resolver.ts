import type {
  GovernanceIncidentRecoveryProfileRenderingPolicyInput,
  GovernanceIncidentRecoveryProfileRenderingPolicyMatch,
  GovernanceIncidentRecoveryProfileRenderingPolicyRule,
} from "./incident-recovery-profile-rendering-policy.types";

export function resolveIncidentRecoveryProfileRenderingPolicy(input: {
  runtime: GovernanceIncidentRecoveryProfileRenderingPolicyInput;
  rules: GovernanceIncidentRecoveryProfileRenderingPolicyRule[];
}): {
  selected: GovernanceIncidentRecoveryProfileRenderingPolicyRule;
  matches: GovernanceIncidentRecoveryProfileRenderingPolicyMatch[];
} {
  const preferredMode =
    input.runtime.mode ??
    (input.runtime.migration.status === "fallback" ? "compat" : "strict");
  const matches = input.rules.map((rule) => ({
    ruleId: rule.ruleId,
    matched: rule.mode === preferredMode,
    reason: rule.mode === preferredMode ? "mode selected" : "not selected",
  }));
  const selected = input.rules.find((rule) => rule.mode === preferredMode) ?? input.rules[0];
  return { selected, matches };
}
