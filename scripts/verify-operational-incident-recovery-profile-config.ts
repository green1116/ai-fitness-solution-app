/**
 * V4-A3-R9.1 Operational Governance Incident Recovery Profile Configuration Runtime — verification
 */
import {
  buildOperationalGovernanceRuntime,
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_CONFIG_VERSION,
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_JSON_SOURCE_VERSION,
} from "../lib/operations/governance";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const runtime = buildOperationalGovernanceRuntime({
    deploymentId: "v4-verify-incident-profile-config",
    incidentRecoveryProfileJsonSourcePath: "config/not-found-for-inline-priority.json",
    incidentRecoveryProfileConfig: {
      sourceType: "inline",
      profileVersion: "external-inline-v1",
      mergeStrategy: "priorityMerge",
      profiles: [
        {
          profileId: "profile-audit-recovery",
          profileName: "audit-recovery-external",
          category: "audit",
          enabled: true,
          priority: 120,
          strategy: "replay",
          allowAutomation: true,
          preferRollback: false,
          allowDegraded: true,
          requireManualIntervention: false,
          allowPartialRecovery: true,
          rules: [
            {
              ruleId: "rule-external-audit-replay",
              description: "External config prefers replay for audit-sensitive incidents.",
              severity: "high",
              predicate: "auditRequired",
            },
          ],
          rationale: "External profile extension for audit-first recovery.",
        },
      ],
    },
  });

  assert(runtime.incidentRecoveryProfileConfigVersion === GOVERNANCE_INCIDENT_RECOVERY_PROFILE_CONFIG_VERSION, "config runtime version");
  assert(runtime.incidentRecoveryProfileConfigSource.type === "inline", "inline source loaded");
  assert(runtime.incidentRecoveryProfileConfigResolved.selectedSourceId.length > 0, "resolver executed");
  assert(runtime.incidentRecoveryProfileConfigMerged.length > 0, "merge executed");
  assert(runtime.incidentRecoveryProfileConfigTrace.merge.length > 0, "merge trace exists");
  assert(runtime.incidentRecoveryProfileConfigSummary.length > 0, "summary non-empty");
  assert(runtime.incidentRecoveryProfileConfigSnapshot.profileVersion === "external-inline-v1", "config version recorded");
  assert(runtime.incidentRecoveryProfileConfigResolved.decision.strategy === runtime.recoveryStrategy, "resolved decision affects final strategy");
  assert(runtime.incidentRecoveryProfileJsonSourceVersion === GOVERNANCE_INCIDENT_RECOVERY_PROFILE_JSON_SOURCE_VERSION, "json source version");
  assert(runtime.incidentRecoveryProfileJsonSourceSummary.length > 0, "json source summary");
  assert(runtime.incidentRecoveryProfileJsonSchemaEvolutionSummary.length > 0, "json schema evolution summary");
  assert(runtime.incidentRecoveryProfileMigrationRuleRegistrySummary.length > 0, "migration registry summary");
  assert(runtime.incidentRecoveryProfileMigrationExecutionSummary.length > 0, "migration execution summary");
  assert(runtime.incidentRecoveryProfileCanonicalContractSummary.length > 0, "canonical contract summary");
  assert(runtime.incidentRecoveryProfileExternalConsumerRegistrySummary.length > 0, "external consumer registry summary");
  assert(runtime.incidentRecoveryProfileExternalConsumerRegistrySourceAdapterSummary.length > 0, "source adapter summary");
  assert(runtime.incidentRecoveryProfileExternalConsumerRegistryConfigSummary.length > 0, "config summary");

  console.log("✓ operational incident recovery profile config runtime");
  console.log(" ", runtime.incidentRecoveryProfileConfigSummary);
}

main();
