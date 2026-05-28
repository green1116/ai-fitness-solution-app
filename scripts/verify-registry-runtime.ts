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
  console.log("✓ verify registry contains governance + rulebook + policy-pack + orchestration + lifecycle + persistence + store + recovery + incident-profile + incident-profile-config + incident-profile-json-source + incident-profile-json-schema-guard + incident-profile-json-schema-evolution + migration-registry + rendering-policy + migration-execution + canonical-contract + external-consumer-registry + external-consumer-registry-config + external-consumer-registry-source-adapter");
}

main();
