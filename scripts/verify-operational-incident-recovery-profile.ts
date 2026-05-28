/**
 * V4-A3-R9 Operational Governance Incident Recovery Profile Runtime — verification
 */
import {
  buildGovernanceOrchestration,
  buildGovernanceLifecycle,
  buildGovernancePersistence,
  buildGovernanceStoreRuntime,
  buildGovernanceRecovery,
  buildIncidentRecoveryProfileRuntime,
  buildIncidentRecoveryProfileConfigRuntime,
  buildOperationalGovernanceRuntime,
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_VERSION,
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_CONFIG_VERSION,
  adaptGovernanceCandidates,
  evaluateGovernanceRulebook,
  evaluateGovernancePolicyPack,
  loadGovernanceRulebook,
  loadGovernancePolicyPacks,
} from "../lib/operations/governance";
import { buildV4OperationalIntelligenceRuntime } from "../lib/operations/intelligence";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const deploymentId = "v4-verify-incident-profile";
  const intelligence = buildV4OperationalIntelligenceRuntime({
    deploymentId: `${deploymentId}-intelligence`,
  });
  const candidates = adaptGovernanceCandidates({ deploymentId, intelligence });
  const rulebook = loadGovernanceRulebook();
  const rulebookEvaluation = evaluateGovernanceRulebook({ candidates, rulebook });
  const packs = loadGovernancePolicyPacks();
  const policyPackEvaluation = evaluateGovernancePolicyPack({
    deploymentId,
    intelligence,
    candidates,
    rulebookEvaluation,
    packs,
  });
  const orchestration = buildGovernanceOrchestration({
    deploymentId,
    observedAt: new Date().toISOString(),
    policyPackMode: policyPackEvaluation.mode,
    ruleEvaluation: policyPackEvaluation.adjustedRuleEvaluation,
    rulebookEvaluation,
    policyPackEvaluation,
  });
  const lifecycle = buildGovernanceLifecycle({
    deploymentId,
    observedAt: new Date().toISOString(),
    orchestration,
  });
  const persistence = buildGovernancePersistence({
    runtimeName: "V4-A3 Operational Governance Runtime",
    runtimeVersion: "4-a3-operational-governance-1",
    inputSnapshot: {
      deploymentId,
      intelligenceRuntimeId: intelligence.runtimeId,
      intelligenceSummary: intelligence.summary.summary,
    },
    rulebookVersion: rulebook.version,
    policyPackVersion: packs[0]?.version ?? "v4-a3-r3-policy-pack-1",
    policyPackMode: policyPackEvaluation.mode,
    orchestration,
    lifecycle,
    summaryText: lifecycle.summary.text,
  });
  const store = buildGovernanceStoreRuntime({
    persistence,
    keyspace: deploymentId,
    backend: "memory",
  });
  const recovery = buildGovernanceRecovery({
    deploymentId,
    lifecycle,
    persistence,
    store,
  });
  const profile = buildIncidentRecoveryProfileRuntime({
    deploymentId,
    lifecycle,
    persistence,
    store,
    recovery,
  });
  const profileConfig = buildIncidentRecoveryProfileConfigRuntime({
    deploymentId,
    incidentRecoveryProfile: profile,
  });

  assert(profile.version === GOVERNANCE_INCIDENT_RECOVERY_PROFILE_VERSION, "profile version");
  assert(profile.registry.profiles.length >= 3, "profile registry");
  assert(profile.matches.length > 0, "profile matcher");
  assert(profile.trace.candidateProfiles.length > 0, "profile trace");
  assert(profile.summary.text.length > 0, "profile summary");
  assert(profile.decision.strategy.length > 0, "profile decision");
  assert(profileConfig.version === GOVERNANCE_INCIDENT_RECOVERY_PROFILE_CONFIG_VERSION, "profile config version");
  assert(profileConfig.summary.text.length > 0, "profile config summary");
  assert(profileConfig.resolved.decision.strategy === profile.decision.strategy, "config keeps R9 decision");

  const runtime = buildOperationalGovernanceRuntime({
    deploymentId: "v4-verify-incident-profile-json-fallback",
    incidentRecoveryProfileJsonSourcePath: "config/not-exists.json",
  });
  assert(runtime.incidentRecoveryProfileJsonSourceResolved.fallbackToBuiltin, "json source fallback");
  assert(runtime.incidentRecoveryProfileJsonSourceSummary.length > 0, "json source summary");
  assert(runtime.incidentRecoveryProfileJsonSchemaEvolutionSummary.length > 0, "json schema evolution summary");
  assert(runtime.incidentRecoveryProfileRenderingPolicySummary.length > 0, "rendering policy summary");
  assert(runtime.incidentRecoveryProfileMigrationExecutionSummary.length > 0, "migration execution summary");
  assert(runtime.incidentRecoveryProfileCanonicalContractSummary.length > 0, "canonical contract summary");
  assert(runtime.incidentRecoveryProfileExternalConsumerRegistrySummary.length > 0, "external consumer registry summary");
  assert(runtime.incidentRecoveryProfileExternalConsumerRegistrySourceAdapterSummary.length > 0, "source adapter summary");
  assert(runtime.incidentRecoveryProfileExternalConsumerRegistryConfigSummary.length > 0, "config summary");

  console.log("✓ operational incident recovery profile runtime");
  console.log(" ", profile.summary.text);
}

main();
