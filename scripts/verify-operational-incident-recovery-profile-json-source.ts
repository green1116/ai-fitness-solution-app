/**
 * V4-A3-R9.1.1 Operational Governance Incident Recovery Profile JSON Local Source Runtime — verification
 */
import {
  buildOperationalGovernanceRuntime,
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_JSON_SOURCE_VERSION,
} from "../lib/operations/governance";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const success = buildOperationalGovernanceRuntime({
    deploymentId: "v4-verify-incident-profile-json-source",
  });
  assert(success.incidentRecoveryProfileJsonSourceVersion === GOVERNANCE_INCIDENT_RECOVERY_PROFILE_JSON_SOURCE_VERSION, "json source version");
  assert(success.incidentRecoveryProfileJsonSourceLoaded.loaded, "json source loaded");
  assert(success.incidentRecoveryProfileJsonSourceValidated.valid, "json source validated");
  assert(success.incidentRecoveryProfileJsonSourceSummary.length > 0, "json source summary");
  assert(success.incidentRecoveryProfileJsonSchemaGuardSummary.length > 0, "json schema guard summary");
  assert(success.incidentRecoveryProfileJsonSchemaEvolutionSummary.length > 0, "json schema evolution summary");
  assert(success.incidentRecoveryProfileRenderingPolicySummary.length > 0, "rendering policy summary");
  assert(success.incidentRecoveryProfileMigrationExecutionSummary.length > 0, "migration execution summary");
  assert(success.incidentRecoveryProfileCanonicalContractSummary.length > 0, "canonical contract summary");
  assert(success.incidentRecoveryProfileExternalConsumerRegistrySummary.length > 0, "external consumer registry summary");
  assert(success.incidentRecoveryProfileExternalConsumerRegistrySourceAdapterSummary.length > 0, "source adapter summary");
  assert(success.incidentRecoveryProfileExternalConsumerRegistryConfigSummary.length > 0, "config summary");

  const fallback = buildOperationalGovernanceRuntime({
    deploymentId: "v4-verify-incident-profile-json-source-fallback",
    incidentRecoveryProfileJsonSourcePath: "config/not-found-local-profile.json",
  });
  assert(fallback.incidentRecoveryProfileJsonSourceResolved.fallbackToBuiltin, "json source fallback");
  assert(fallback.incidentRecoveryProfileJsonSourceTrace.fallback.length > 0, "json fallback trace");

  console.log("✓ operational incident recovery profile json source runtime");
  console.log(" ", success.incidentRecoveryProfileJsonSourceSummary);
}

main();
