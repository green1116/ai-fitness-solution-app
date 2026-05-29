/**
 * Verify registry contains operational governance entry.
 */
import { VERIFY_REGISTRY, VERIFY_GROUP_LABELS, verifyEntriesForGroup } from "./verify-registry";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const governanceEntries = verifyEntriesForGroup("operational-governance");
  assert(VERIFY_GROUP_LABELS["operational-governance"].length > 0, "group label exists");
  assert(governanceEntries.length >= 1, "group has at least one script");
  const hasGovernanceScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:operational-governance",
  );
  const hasRulebookScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:operational-rulebook",
  );
  const hasPolicyPackScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:operational-policy-pack",
  );
  const hasOrchestrationScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:operational-orchestration",
  );
  const hasLifecycleScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:operational-lifecycle",
  );
  const hasPersistenceScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:operational-persistence",
  );
  const hasStoreScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:operational-store",
  );
  const hasRecoveryScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:operational-recovery",
  );
  const hasIncidentProfileScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:operational-incident-recovery-profile",
  );
  const hasIncidentProfileConfigScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:operational-incident-recovery-profile-config",
  );
  const hasIncidentProfileJsonSourceScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:operational-incident-recovery-profile-json-source",
  );
  const hasIncidentProfileJsonSchemaGuardScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:operational-incident-recovery-profile-json-schema-guard",
  );
  const hasIncidentProfileJsonSchemaEvolutionScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:operational-incident-recovery-profile-json-schema-evolution",
  );
  const hasMigrationRegistryScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:operational-incident-recovery-profile-migration-rule-registry",
  );
  const hasRenderingPolicyScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:operational-incident-recovery-profile-rendering-policy",
  );
  const hasMigrationExecutionScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:operational-incident-recovery-profile-migration-execution",
  );
  const hasCanonicalContractScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:operational-incident-recovery-profile-canonical-contract",
  );
  const hasExternalConsumerRegistryScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:operational-incident-recovery-profile-external-consumer-registry",
  );
  const hasExternalConsumerRegistryConfigScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:operational-incident-recovery-profile-external-consumer-registry-config",
  );
  const hasExternalConsumerRegistrySourceAdapterScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:operational-incident-recovery-profile-external-consumer-registry-source-adapter",
  );
  const hasConsumerCapabilityNegotiationScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:consumer-capability-negotiation",
  );
  const hasFederationRuntimeScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:federation-runtime",
  );
  const hasFederationConsensusScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:federation-consensus",
  );
  const hasFederationPolicyPropagationScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:federation-policy-propagation",
  );
  const hasFederationLifecycleContinuityScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:federation-lifecycle-continuity",
  );
  const hasFederationObservabilityScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:federation-observability",
  );
  const hasGovernanceIntelligenceScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:governance-intelligence",
  );
  const hasGovernanceAutonomousScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:governance-autonomous",
  );
  const hasGovernanceSelfOptimizationScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:governance-self-optimization",
  );
  const hasGovernanceMetaGovernanceScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:governance-meta-governance",
  );
  const hasGovernancePlatformBaselineScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:governance-platform-baseline",
  );
  const hasOperationalAutonomousExecutionScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:operational-autonomous-execution",
  );
  const hasAutonomousChangeManagementScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:autonomous-change-management",
  );
  const hasAutonomousIncidentManagementScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:autonomous-incident-management",
  );
  const hasAutonomousRecoveryOrchestrationScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:autonomous-recovery-orchestration",
  );
  const hasAutonomousOperationsCenterScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:autonomous-operations-center",
  );
  const hasAutonomousCommandPlatformScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:autonomous-command-platform",
  );
  const hasCommandExecutionBridgeScript = VERIFY_REGISTRY.some(
    (entry) => entry.npmScript === "verify:command-execution-bridge",
  );
  assert(hasGovernanceScript, "verify:operational-governance registered");
  assert(hasRulebookScript, "verify:operational-rulebook registered");
  assert(hasPolicyPackScript, "verify:operational-policy-pack registered");
  assert(hasOrchestrationScript, "verify:operational-orchestration registered");
  assert(hasLifecycleScript, "verify:operational-lifecycle registered");
  assert(hasPersistenceScript, "verify:operational-persistence registered");
  assert(hasStoreScript, "verify:operational-store registered");
  assert(hasRecoveryScript, "verify:operational-recovery registered");
  assert(hasIncidentProfileScript, "verify:operational-incident-recovery-profile registered");
  assert(hasIncidentProfileConfigScript, "verify:operational-incident-recovery-profile-config registered");
  assert(hasIncidentProfileJsonSourceScript, "verify:operational-incident-recovery-profile-json-source registered");
  assert(hasIncidentProfileJsonSchemaGuardScript, "verify:operational-incident-recovery-profile-json-schema-guard registered");
  assert(hasIncidentProfileJsonSchemaEvolutionScript, "verify:operational-incident-recovery-profile-json-schema-evolution registered");
  assert(hasMigrationRegistryScript, "verify:operational-incident-recovery-profile-migration-rule-registry registered");
  assert(hasRenderingPolicyScript, "verify:operational-incident-recovery-profile-rendering-policy registered");
  assert(hasMigrationExecutionScript, "verify:operational-incident-recovery-profile-migration-execution registered");
  assert(hasCanonicalContractScript, "verify:operational-incident-recovery-profile-canonical-contract registered");
  assert(hasExternalConsumerRegistryScript, "verify:operational-incident-recovery-profile-external-consumer-registry registered");
  assert(hasExternalConsumerRegistryConfigScript, "verify:operational-incident-recovery-profile-external-consumer-registry-config registered");
  assert(hasExternalConsumerRegistrySourceAdapterScript, "verify:operational-incident-recovery-profile-external-consumer-registry-source-adapter registered");
  assert(hasConsumerCapabilityNegotiationScript, "verify:consumer-capability-negotiation registered");
  assert(hasFederationRuntimeScript, "verify:federation-runtime registered");
  assert(hasFederationConsensusScript, "verify:federation-consensus registered");
  assert(hasFederationPolicyPropagationScript, "verify:federation-policy-propagation registered");
  assert(hasFederationLifecycleContinuityScript, "verify:federation-lifecycle-continuity registered");
  assert(hasFederationObservabilityScript, "verify:federation-observability registered");
  assert(hasGovernanceIntelligenceScript, "verify:governance-intelligence registered");
  assert(hasGovernanceAutonomousScript, "verify:governance-autonomous registered");
  assert(hasGovernanceSelfOptimizationScript, "verify:governance-self-optimization registered");
  assert(hasGovernanceMetaGovernanceScript, "verify:governance-meta-governance registered");
  assert(hasGovernancePlatformBaselineScript, "verify:governance-platform-baseline registered");
  assert(hasOperationalAutonomousExecutionScript, "verify:operational-autonomous-execution registered");
  assert(hasAutonomousChangeManagementScript, "verify:autonomous-change-management registered");
  assert(hasAutonomousIncidentManagementScript, "verify:autonomous-incident-management registered");
  assert(hasAutonomousRecoveryOrchestrationScript, "verify:autonomous-recovery-orchestration registered");
  assert(hasAutonomousOperationsCenterScript, "verify:autonomous-operations-center registered");
  assert(hasAutonomousCommandPlatformScript, "verify:autonomous-command-platform registered");
  assert(hasCommandExecutionBridgeScript, "verify:command-execution-bridge registered");
  console.log("✓ verify registry contains governance + rulebook + policy-pack + orchestration + lifecycle + persistence + store + recovery + incident-profile + incident-profile-config + incident-profile-json-source + incident-profile-json-schema-guard + incident-profile-json-schema-evolution + migration-registry + rendering-policy + migration-execution + canonical-contract + external-consumer-registry + external-consumer-registry-config + external-consumer-registry-source-adapter + consumer-capability-negotiation + federation-runtime + federation-consensus + federation-policy-propagation + federation-lifecycle-continuity + federation-observability + governance-intelligence + governance-autonomous + governance-self-optimization + governance-meta-governance + governance-platform-baseline + operational-autonomous-execution + autonomous-change-management + autonomous-incident-management + autonomous-recovery-orchestration + autonomous-operations-center + autonomous-command-platform + command-execution-bridge");
}

main();
