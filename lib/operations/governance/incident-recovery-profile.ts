import {
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_VERSION,
  type GovernanceIncidentRecoveryProfileInput,
  type GovernanceIncidentRecoveryProfileResult,
} from "./incident-recovery-profile.types";
import { buildIncidentRecoveryProfileRegistry } from "./incident-recovery-profile.registry";
import { matchIncidentRecoveryProfile } from "./incident-recovery-profile.matcher";
import { selectIncidentRecoveryProfile } from "./incident-recovery-profile.selector";
import { buildIncidentRecoveryProfileTrace } from "./incident-recovery-profile.trace";
import { summarizeIncidentRecoveryProfile } from "./incident-recovery-profile.summary";

export function buildIncidentRecoveryProfileRuntime(
  input: GovernanceIncidentRecoveryProfileInput,
): GovernanceIncidentRecoveryProfileResult {
  const registry = buildIncidentRecoveryProfileRegistry();
  const matches = registry.profiles.map((profile) =>
    matchIncidentRecoveryProfile({ profile, context: input }),
  );
  const chosen = selectIncidentRecoveryProfile({
    profiles: registry.profiles,
    matches,
  });
  const trace = buildIncidentRecoveryProfileTrace({
    profiles: registry.profiles,
    matches,
    chosen,
  });

  const status: GovernanceIncidentRecoveryProfileResult["status"] = chosen.requireManualIntervention
    ? "manualInterventionRequired"
    : chosen.allowDegraded
      ? "degraded"
      : "selected";

  const core: Omit<GovernanceIncidentRecoveryProfileResult, "summary"> = {
    version: GOVERNANCE_INCIDENT_RECOVERY_PROFILE_VERSION,
    status,
    snapshot: chosen,
    matches,
    registry,
    trace,
    decision: {
      profileId: chosen.profileId,
      strategy: chosen.strategy,
      requiresManualIntervention: chosen.requireManualIntervention,
      degradedMode: chosen.allowDegraded,
      partialRecovery: chosen.allowPartialRecovery,
    },
  };

  return {
    ...core,
    summary: summarizeIncidentRecoveryProfile(core),
  };
}

export { GOVERNANCE_INCIDENT_RECOVERY_PROFILE_VERSION };
