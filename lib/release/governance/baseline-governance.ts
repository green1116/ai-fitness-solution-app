/**
 * V3.7 FINAL —baseline governance policy (static)
 */

import { buildReleaseBaseline } from "../baseline/release-baseline";
import { V37_FINAL_RELEASE_GENERATION } from "../shared";

export const BASELINE_GOVERNANCE_VERSION = "3.7-final-baseline-governance-1" as const;

export type BaselineGovernancePolicy = {
  version: typeof BASELINE_GOVERNANCE_VERSION;
  policyId: string;
  generation: typeof V37_FINAL_RELEASE_GENERATION;
  baselineGovernanceEnforced: boolean;
  lineageTracked: boolean;
  summary: string;
};

export function buildBaselineGovernancePolicy(input?: { deploymentId?: string }): BaselineGovernancePolicy {
  const deploymentId = input?.deploymentId ?? "baseline-governance";
  const policyId = `BGP-V37FINAL-${deploymentId.slice(0, 8)}`;
  const baseline = buildReleaseBaseline({ deploymentId });

  return {
    version: BASELINE_GOVERNANCE_VERSION,
    policyId,
    generation: V37_FINAL_RELEASE_GENERATION,
    baselineGovernanceEnforced: baseline.readyForProduction,
    lineageTracked: true,
    summary: `baseline-governance id=${policyId} enforced=${baseline.readyForProduction} lineage=true`,
  };
}
