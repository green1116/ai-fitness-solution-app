/**
 * V3.7 FINAL —restoration governance policy (static)
 */

import { buildIntegrityRestoreVerification } from "../integrity/integrity-restore";
import { V37_RESTORATION_WINDOW, V37_FINAL_RELEASE_GENERATION } from "../shared";

export const RESTORATION_GOVERNANCE_VERSION = "3.7-final-restoration-governance-1" as const;

export type RestorationGovernancePolicy = {
  version: typeof RESTORATION_GOVERNANCE_VERSION;
  policyId: string;
  generation: typeof V37_FINAL_RELEASE_GENERATION;
  restorationWindow: typeof V37_RESTORATION_WINDOW;
  restorationPolicyEnforced: boolean;
  restorationReady: boolean;
  summary: string;
};

export function buildRestorationGovernancePolicy(input?: { deploymentId?: string }): RestorationGovernancePolicy {
  const deploymentId = input?.deploymentId ?? "restoration-governance";
  const policyId = `RSP-V37FINAL-${deploymentId.slice(0, 8)}`;
  const restore = buildIntegrityRestoreVerification({ deploymentId });

  return {
    version: RESTORATION_GOVERNANCE_VERSION,
    policyId,
    generation: V37_FINAL_RELEASE_GENERATION,
    restorationWindow: V37_RESTORATION_WINDOW,
    restorationPolicyEnforced: true,
    restorationReady: restore.restoreReady,
    summary: `restoration-governance id=${policyId} ready=${restore.restoreReady} window=${V37_RESTORATION_WINDOW}`,
  };
}
