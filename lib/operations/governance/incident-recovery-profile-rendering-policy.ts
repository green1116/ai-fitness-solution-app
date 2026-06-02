import {
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_RENDERING_POLICY_VERSION,
  type GovernanceIncidentRecoveryProfileRenderingPolicyInput,
  type GovernanceIncidentRecoveryProfileRenderingPolicyResult,
} from "./incident-recovery-profile-rendering-policy.types";
import { loadIncidentRecoveryProfileRenderingPolicyRules } from "./incident-recovery-profile-rendering-policy.loader";
import { resolveIncidentRecoveryProfileRenderingPolicy } from "./incident-recovery-profile-rendering-policy.resolver";
import { renderIncidentRecoveryProfilePolicyActions } from "./incident-recovery-profile-rendering-policy.render";
import { buildIncidentRecoveryProfileRenderingPolicyTrace } from "./incident-recovery-profile-rendering-policy.trace";
import { summarizeIncidentRecoveryProfileRenderingPolicy } from "./incident-recovery-profile-rendering-policy.summary";

export function buildIncidentRecoveryProfileRenderingPolicyRuntime(
  input: GovernanceIncidentRecoveryProfileRenderingPolicyInput,
): GovernanceIncidentRecoveryProfileRenderingPolicyResult {
  const rules = loadIncidentRecoveryProfileRenderingPolicyRules();
  const resolved = resolveIncidentRecoveryProfileRenderingPolicy({
    runtime: input,
    rules,
  });
  const actions = renderIncidentRecoveryProfilePolicyActions(resolved.selected);
  const trace = buildIncidentRecoveryProfileRenderingPolicyTrace({
    deploymentId: input.deploymentId,
    mode: resolved.selected.mode,
    actions,
  });
  const status: GovernanceIncidentRecoveryProfileRenderingPolicyResult["status"] =
    resolved.selected.mode === "compat" ? "compatApplied" : "applied";
  const core: Omit<GovernanceIncidentRecoveryProfileRenderingPolicyResult, "summary"> = {
    version: GOVERNANCE_INCIDENT_RECOVERY_PROFILE_RENDERING_POLICY_VERSION,
    mode: resolved.selected.mode,
    snapshot: resolved.selected,
    matches: resolved.matches,
    trace,
    status,
  };
  return { ...core, summary: summarizeIncidentRecoveryProfileRenderingPolicy(core) };
}

export { GOVERNANCE_INCIDENT_RECOVERY_PROFILE_RENDERING_POLICY_VERSION };
