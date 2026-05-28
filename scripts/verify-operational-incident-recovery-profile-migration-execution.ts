/**
 * V4-A3-R9.1.5 Operational Governance Incident Recovery Profile Migration Execution Runtime — verification
 */
import {
  buildOperationalGovernanceRuntime,
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_MIGRATION_EXECUTION_VERSION,
} from "../lib/operations/governance";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const runtime = buildOperationalGovernanceRuntime({
    deploymentId: "v4-verify-incident-profile-migration-execution",
  });
  assert(
    runtime.incidentRecoveryProfileMigrationExecutionVersion ===
      GOVERNANCE_INCIDENT_RECOVERY_PROFILE_MIGRATION_EXECUTION_VERSION,
    "migration execution version",
  );
  assert(runtime.incidentRecoveryProfileMigrationExecutionPlan.orderedSteps.length > 0, "execution plan");
  assert(runtime.incidentRecoveryProfileMigrationExecutionCanonical.canonicalProfiles.length > 0, "canonical payload");
  assert(runtime.incidentRecoveryProfileMigrationExecutionTrace.traceId.length > 0, "execution trace");
  assert(runtime.incidentRecoveryProfileMigrationExecutionSummary.length > 0, "execution summary");
  assert(runtime.incidentRecoveryProfileCanonicalContractSummary.length > 0, "canonical contract linked");
  assert(runtime.incidentRecoveryProfileExternalConsumerRegistrySummary.length > 0, "external consumer registry linked");
  assert(runtime.incidentRecoveryProfileExternalConsumerRegistrySourceAdapterSummary.length > 0, "source adapter linked");
  assert(runtime.incidentRecoveryProfileExternalConsumerRegistryConfigSummary.length > 0, "config linked");

  const dryRun = buildOperationalGovernanceRuntime({
    deploymentId: "v4-verify-incident-profile-migration-execution-dryrun",
    incidentRecoveryProfileMigrationExecutionMode: "dry-run",
  });
  assert(dryRun.incidentRecoveryProfileMigrationExecutionMode === "dry-run", "dry run mode");
  assert(dryRun.incidentRecoveryProfileMigrationExecutionStatus === "dryRun", "dry run status");

  console.log("✓ operational incident recovery profile migration execution runtime");
  console.log(" ", runtime.incidentRecoveryProfileMigrationExecutionSummary);
}

main();
