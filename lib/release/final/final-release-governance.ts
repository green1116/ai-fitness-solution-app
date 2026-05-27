/**
 * V3.7 FINAL —final release governance bundle
 */

import { buildFreezeGovernancePolicy } from "../governance/freeze-governance";
import { buildReleaseGovernancePolicy } from "../governance/release-governance";
import { buildBaselineGovernancePolicy } from "../governance/baseline-governance";
import { buildRollbackGovernancePolicy } from "../governance/rollback-governance";
import { buildRestorationGovernancePolicy } from "../governance/restoration-governance";

export const FINAL_RELEASE_GOVERNANCE_VERSION = "3.7-final-release-governance-1" as const;

export type FinalReleaseGovernanceBundle = {
  version: typeof FINAL_RELEASE_GOVERNANCE_VERSION;
  bundleId: string;
  freeze: ReturnType<typeof buildFreezeGovernancePolicy>;
  release: ReturnType<typeof buildReleaseGovernancePolicy>;
  baseline: ReturnType<typeof buildBaselineGovernancePolicy>;
  rollback: ReturnType<typeof buildRollbackGovernancePolicy>;
  restoration: ReturnType<typeof buildRestorationGovernancePolicy>;
  allEnforced: boolean;
  summary: string;
};

export function buildFinalReleaseGovernanceBundle(input?: { deploymentId?: string }): FinalReleaseGovernanceBundle {
  const deploymentId = input?.deploymentId ?? "final-governance";
  const bundleId = `FRG-V37FINAL-${deploymentId.slice(0, 8)}`;
  const freeze = buildFreezeGovernancePolicy({ deploymentId });
  const release = buildReleaseGovernancePolicy({ deploymentId });
  const baseline = buildBaselineGovernancePolicy({ deploymentId });
  const rollback = buildRollbackGovernancePolicy({ deploymentId });
  const restoration = buildRestorationGovernancePolicy({ deploymentId });

  const allEnforced =
    freeze.freezePolicyEnforced &&
    release.releaseApproved &&
    baseline.baselineGovernanceEnforced &&
    rollback.rollbackPolicyEnforced &&
    restoration.restorationPolicyEnforced;

  return {
    version: FINAL_RELEASE_GOVERNANCE_VERSION,
    bundleId,
    freeze,
    release,
    baseline,
    rollback,
    restoration,
    allEnforced,
    summary: `final-release-governance id=${bundleId} allEnforced=${allEnforced}`,
  };
}
