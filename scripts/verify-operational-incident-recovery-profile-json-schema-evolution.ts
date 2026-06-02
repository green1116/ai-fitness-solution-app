/**
 * V4-A3-R9.1.3 Operational Governance Incident Recovery Profile JSON Schema Evolution Runtime — verification
 */
import {
  buildOperationalGovernanceRuntime,
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_JSON_SCHEMA_EVOLUTION_VERSION,
} from "../lib/operations/governance";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const runtime = buildOperationalGovernanceRuntime({
    deploymentId: "v4-verify-incident-profile-json-schema-evolution",
  });
  assert(
    runtime.incidentRecoveryProfileJsonSchemaEvolutionVersion ===
      GOVERNANCE_INCIDENT_RECOVERY_PROFILE_JSON_SCHEMA_EVOLUTION_VERSION,
    "evolution version",
  );
  assert(runtime.incidentRecoveryProfileJsonSchemaEvolutionCompatibility.length > 0, "compatibility");
  assert(runtime.incidentRecoveryProfileJsonSchemaEvolutionAliases.length > 0, "aliases");
  assert(runtime.incidentRecoveryProfileJsonSchemaEvolutionSummary.length > 0, "summary");
  assert(runtime.incidentRecoveryProfileJsonSchemaEvolutionTrace.traceId.length > 0, "trace");
  assert(runtime.incidentRecoveryProfileMigrationRuleRegistrySummary.length > 0, "migration registry summary");
  assert(runtime.incidentRecoveryProfileRenderingPolicySummary.length > 0, "rendering policy summary");
  assert(runtime.incidentRecoveryProfileMigrationExecutionSummary.length > 0, "migration execution summary");
  assert(runtime.incidentRecoveryProfileCanonicalContractSummary.length > 0, "canonical contract summary");
  assert(runtime.incidentRecoveryProfileExternalConsumerRegistrySummary.length > 0, "external consumer registry summary");
  assert(runtime.incidentRecoveryProfileExternalConsumerRegistrySourceAdapterSummary.length > 0, "source adapter summary");
  assert(runtime.incidentRecoveryProfileExternalConsumerRegistryConfigSummary.length > 0, "config summary");

  const legacyFallback = buildOperationalGovernanceRuntime({
    deploymentId: "v4-verify-incident-profile-json-schema-evolution-fallback",
    incidentRecoveryProfileJsonSourcePath: "config/not-exists-legacy-schema.json",
  });
  assert(
    legacyFallback.incidentRecoveryProfileJsonSchemaEvolutionStatus === "fallback" ||
      legacyFallback.incidentRecoveryProfileJsonSchemaEvolutionStatus === "incompatible",
    "fallback or incompatible",
  );

  console.log("✓ operational incident recovery profile json schema evolution runtime");
  console.log(" ", runtime.incidentRecoveryProfileJsonSchemaEvolutionSummary);
}

main();
