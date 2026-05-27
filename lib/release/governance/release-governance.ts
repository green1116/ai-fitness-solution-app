/**
 * V3.7 FINAL —release governance policy (static)
 */

import { getEnterpriseStackSnapshot } from "../release-context";
import { V37_FINAL_RELEASE_GENERATION } from "../shared";

export const RELEASE_GOVERNANCE_VERSION = "3.7-final-release-governance-1" as const;

export type ReleaseGovernancePolicy = {
  version: typeof RELEASE_GOVERNANCE_VERSION;
  policyId: string;
  generation: typeof V37_FINAL_RELEASE_GENERATION;
  releaseApprovalRequired: boolean;
  releaseApproved: boolean;
  governanceContinuity: boolean;
  summary: string;
};

export function buildReleaseGovernancePolicy(input?: { deploymentId?: string }): ReleaseGovernancePolicy {
  const deploymentId = input?.deploymentId ?? "release-governance";
  const policyId = `RGP-V37FINAL-${deploymentId.slice(0, 8)}`;
  const stack = getEnterpriseStackSnapshot(deploymentId);

  const releaseApproved = stack.manifest.readyForEnterprise;
  const governanceContinuity = stack.summary.governanceClosureReady;

  return {
    version: RELEASE_GOVERNANCE_VERSION,
    policyId,
    generation: V37_FINAL_RELEASE_GENERATION,
    releaseApprovalRequired: true,
    releaseApproved,
    governanceContinuity,
    summary: `release-governance id=${policyId} approved=${releaseApproved} governance=${governanceContinuity}`,
  };
}
