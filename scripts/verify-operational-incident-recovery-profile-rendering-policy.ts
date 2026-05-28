/**
 * V4-A3-R9.1.4 Operational Governance Incident Recovery Profile Rendering Policy — verification
 */
import {
  buildOperationalGovernanceRuntime,
  GOVERNANCE_INCIDENT_RECOVERY_PROFILE_RENDERING_POLICY_VERSION,
} from "../lib/operations/governance";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const strict = buildOperationalGovernanceRuntime({
    deploymentId: "v4-verify-incident-profile-rendering-policy-strict",
    incidentRecoveryProfileRenderingPolicyMode: "strict",
  });
  assert(
    strict.incidentRecoveryProfileRenderingPolicyVersion ===
      GOVERNANCE_INCIDENT_RECOVERY_PROFILE_RENDERING_POLICY_VERSION,
    "rendering policy version",
  );
  assert(strict.incidentRecoveryProfileRenderingPolicyMode === "strict", "strict mode");
  assert(strict.incidentRecoveryProfileRenderingPolicySummary.length > 0, "summary");
  assert(strict.incidentRecoveryProfileMigrationExecutionSummary.length > 0, "execution summary");
  assert(strict.incidentRecoveryProfileCanonicalContractSummary.length > 0, "canonical contract summary");
  assert(strict.incidentRecoveryProfileExternalConsumerRegistrySummary.length > 0, "external consumer registry summary");
  assert(strict.incidentRecoveryProfileExternalConsumerRegistrySourceAdapterSummary.length > 0, "source adapter summary");
  assert(strict.incidentRecoveryProfileExternalConsumerRegistryConfigSummary.length > 0, "config summary");

  const lenient = buildOperationalGovernanceRuntime({
    deploymentId: "v4-verify-incident-profile-rendering-policy-lenient",
    incidentRecoveryProfileRenderingPolicyMode: "lenient",
  });
  assert(lenient.incidentRecoveryProfileRenderingPolicyMode === "lenient", "lenient mode");

  const audit = buildOperationalGovernanceRuntime({
    deploymentId: "v4-verify-incident-profile-rendering-policy-audit",
    incidentRecoveryProfileRenderingPolicyMode: "audit",
  });
  assert(audit.incidentRecoveryProfileRenderingPolicyMode === "audit", "audit mode");

  const compat = buildOperationalGovernanceRuntime({
    deploymentId: "v4-verify-incident-profile-rendering-policy-compat",
    incidentRecoveryProfileRenderingPolicyMode: "compat",
  });
  assert(compat.incidentRecoveryProfileRenderingPolicyMode === "compat", "compat mode");

  console.log("✓ operational incident recovery profile rendering policy runtime");
  console.log(" ", strict.incidentRecoveryProfileRenderingPolicySummary);
}

main();
