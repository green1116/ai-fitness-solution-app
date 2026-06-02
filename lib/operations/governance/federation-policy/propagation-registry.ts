export const DEFAULT_POLICY_PROPAGATION_VERSION = "policy-propagation-v1";
export const POLICY_PROPAGATION_VERSIONS = [
  DEFAULT_POLICY_PROPAGATION_VERSION,
  "policy-propagation-v1-restricted",
  "policy-propagation-v1-emergency",
] as const;

export function resolvePolicyVersionFromConsensus(consensusDecision: string): string {
  if (consensusDecision === "approved") return "policy-v1-approved";
  if (consensusDecision === "approved_with_restrictions") return "policy-v1-restricted";
  if (consensusDecision === "recovery_required") return "policy-v1-recovery";
  return "policy-v1-rejected";
}
