/**
 * V4-A3-R9.1.2 Operational Governance Incident Recovery Profile JSON Schema Guard Runtime — verification
 */
import {
  buildOperationalGovernanceRuntime,
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_JSON_SCHEMA_GUARD_VERSION,
} from "../lib/operations/governance";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const valid = buildOperationalGovernanceRuntime({
    deploymentId: "v4-verify-incident-profile-json-schema-guard-valid",
  });
  assert(
    valid.incidentRecoveryProfileJsonSchemaGuardVersion ===
      GOVERNANCE_INCIDENT_RECOVERY_PROFILE_JSON_SCHEMA_GUARD_VERSION,
    "guard version",
  );
  assert(valid.incidentRecoveryProfileJsonSchemaGuard.valid, "guard valid");
  assert(valid.incidentRecoveryProfileJsonSchemaGuardSummary.length > 0, "guard summary");
  assert(valid.incidentRecoveryProfileMigrationRuleRegistrySummary.length > 0, "migration registry summary");
  assert(valid.incidentRecoveryProfileMigrationExecutionSummary.length > 0, "migration execution summary");
  assert(valid.incidentRecoveryProfileCanonicalContractSummary.length > 0, "canonical contract summary");
  assert(valid.incidentRecoveryProfileExternalConsumerRegistrySummary.length > 0, "external consumer registry summary");
  assert(valid.incidentRecoveryProfileExternalConsumerRegistrySourceAdapterSummary.length > 0, "source adapter summary");
  assert(valid.incidentRecoveryProfileExternalConsumerRegistryConfigSummary.length > 0, "config summary");

  const fallback = buildOperationalGovernanceRuntime({
    deploymentId: "v4-verify-incident-profile-json-schema-guard-fallback",
    incidentRecoveryProfileJsonSourcePath: "config/does-not-exist-schema.json",
  });
  assert(
    fallback.incidentRecoveryProfileJsonSchemaGuardStatus === "fallback" ||
      fallback.incidentRecoveryProfileJsonSchemaGuardStatus === "invalid",
    "guard fallback or invalid",
  );

  console.log("✓ operational incident recovery profile json schema guard runtime");
  console.log(" ", valid.incidentRecoveryProfileJsonSchemaGuardSummary);
}

main();
