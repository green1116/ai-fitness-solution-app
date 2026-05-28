/**
 * V4-A3-R9.1.4 Operational Governance Incident Recovery Profile Migration Rule Registry — verification
 */
import {
  buildOperationalGovernanceRuntime,
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_MIGRATION_RULE_REGISTRY_VERSION,
} from "../lib/operations/governance";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const runtime = buildOperationalGovernanceRuntime({
    deploymentId: "v4-verify-incident-profile-migration-registry",
  });
  assert(
    runtime.incidentRecoveryProfileMigrationRuleRegistryVersion ===
      GOVERNANCE_INCIDENT_RECOVERY_PROFILE_MIGRATION_RULE_REGISTRY_VERSION,
    "migration registry version",
  );
  assert(runtime.incidentRecoveryProfileMigrationRuleRegistryMatches.length > 0, "matches");
  assert(runtime.incidentRecoveryProfileMigrationRuleRegistryTrace.traceId.length > 0, "trace");
  assert(runtime.incidentRecoveryProfileMigrationRuleRegistrySummary.length > 0, "summary");
  assert(runtime.incidentRecoveryProfileMigrationExecutionSummary.length > 0, "execution summary");
  assert(runtime.incidentRecoveryProfileCanonicalContractSummary.length > 0, "canonical contract summary");
  assert(runtime.incidentRecoveryProfileExternalConsumerRegistrySummary.length > 0, "external consumer registry summary");
  assert(runtime.incidentRecoveryProfileExternalConsumerRegistrySourceAdapterSummary.length > 0, "source adapter summary");
  assert(runtime.incidentRecoveryProfileExternalConsumerRegistryConfigSummary.length > 0, "config summary");

  console.log("✓ operational incident recovery profile migration rule registry runtime");
  console.log(" ", runtime.incidentRecoveryProfileMigrationRuleRegistrySummary);
}

main();
