/**
 * V4-A3-R9.1.6 Operational Governance Incident Recovery Profile Canonical Contract Runtime — verification
 */
import {
  buildOperationalGovernanceRuntime,
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_CANONICAL_CONTRACT_VERSION,
} from "../lib/operations/governance";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const runtime = buildOperationalGovernanceRuntime({
    deploymentId: "v4-verify-incident-profile-canonical-contract",
  });
  assert(
    runtime.incidentRecoveryProfileCanonicalContractVersion ===
      GOVERNANCE_INCIDENT_RECOVERY_PROFILE_CANONICAL_CONTRACT_VERSION,
    "canonical contract version",
  );
  assert(runtime.incidentRecoveryProfileCanonicalContractMatrix.entries.length >= 6, "matrix generated");
  assert(runtime.incidentRecoveryProfileCanonicalContractReport.consumerCount >= 6, "report generated");
  assert(runtime.incidentRecoveryProfileCanonicalContractTrace.traceId.length > 0, "trace generated");
  assert(runtime.incidentRecoveryProfileCanonicalContractSummary.length > 0, "summary generated");
  assert(
    ["compatible", "compatibleWithWarnings", "incompatible", "fallbackCompatible"].includes(
      runtime.incidentRecoveryProfileCanonicalContractStatus,
    ),
    "status classified",
  );
  assert(
    runtime.incidentRecoveryProfileCanonicalContractCompatibility.missingRequiredFields.length === 0,
    "default payload has required fields",
  );
  assert(runtime.incidentRecoveryProfileExternalConsumerRegistrySummary.length > 0, "external consumer registry linked");
  assert(runtime.incidentRecoveryProfileExternalConsumerRegistrySourceAdapterSummary.length > 0, "source adapter linked");
  assert(runtime.incidentRecoveryProfileExternalConsumerRegistryConfigSummary.length > 0, "config linked");

  console.log("✓ operational incident recovery profile canonical contract runtime");
  console.log(" ", runtime.incidentRecoveryProfileCanonicalContractSummary);
}

main();
