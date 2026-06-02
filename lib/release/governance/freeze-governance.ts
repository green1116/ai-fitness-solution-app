/**
 * V3.7 FINAL —freeze governance policy (static)
 */

import { buildFreezeLockState } from "../freeze/freeze-lock";
import { V37_FINAL_RELEASE_GENERATION } from "../shared";

export const FREEZE_GOVERNANCE_VERSION = "3.7-final-freeze-governance-1" as const;

export type FreezeGovernancePolicy = {
  version: typeof FREEZE_GOVERNANCE_VERSION;
  policyId: string;
  generation: typeof V37_FINAL_RELEASE_GENERATION;
  freezePolicyEnforced: boolean;
  sealRequired: boolean;
  integrityRequired: boolean;
  summary: string;
};

export function buildFreezeGovernancePolicy(input?: { deploymentId?: string }): FreezeGovernancePolicy {
  const deploymentId = input?.deploymentId ?? "freeze-governance";
  const policyId = `FGP-V37FINAL-${deploymentId.slice(0, 8)}`;
  const lock = buildFreezeLockState({ deploymentId });

  return {
    version: FREEZE_GOVERNANCE_VERSION,
    policyId,
    generation: V37_FINAL_RELEASE_GENERATION,
    freezePolicyEnforced: lock.locked,
    sealRequired: true,
    integrityRequired: true,
    summary: `freeze-governance id=${policyId} enforced=${lock.locked} generation=${V37_FINAL_RELEASE_GENERATION}`,
  };
}
