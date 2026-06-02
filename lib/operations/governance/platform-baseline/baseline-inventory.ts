import type {
  GovernanceCapabilityInventoryEntry,
  GovernanceCapabilityVersionSnapshot,
  GovernancePlatformBaselineRuntimeInput,
} from "./baseline-types";
import { GOVERNANCE_PLATFORM_CAPABILITY_CATALOG } from "./baseline-registry";

export function buildGovernanceCapabilityInventory(
  input: GovernancePlatformBaselineRuntimeInput,
): GovernanceCapabilityInventoryEntry[] {
  const versionById = new Map(
    input.capabilities.map((entry) => [entry.capabilityId, entry]),
  );

  return GOVERNANCE_PLATFORM_CAPABILITY_CATALOG.map((catalog) => {
    const snapshot = versionById.get(catalog.capabilityId);
    const version = snapshot?.version ?? "missing";
    const present = Boolean(snapshot?.version);

    return {
      entryId: `capability-inventory-${catalog.capabilityId}-${input.deploymentId}`,
      capabilityId: catalog.capabilityId,
      releaseTag: catalog.releaseTag,
      label: catalog.label,
      tier: catalog.tier,
      capabilityClass: catalog.capabilityClass,
      version,
      present,
      frozen: present,
    };
  });
}

export function collectGovernanceCapabilityVersions(input: {
  governanceRulesVersion: string;
  rulebookVersion: string;
  policyPackVersion: string;
  orchestrationVersion: string;
  lifecycleVersion: string;
  persistenceVersion: string;
  storeVersion: string;
  recoveryVersion: string;
  incidentRecoveryProfileVersion: string;
  incidentRecoveryProfileConfigVersion: string;
  incidentRecoveryProfileJsonSourceVersion: string;
  incidentRecoveryProfileJsonSchemaGuardVersion: string;
  incidentRecoveryProfileJsonSchemaEvolutionVersion: string;
  incidentRecoveryProfileMigrationRuleRegistryVersion: string;
  incidentRecoveryProfileRenderingPolicyVersion: string;
  incidentRecoveryProfileMigrationExecutionVersion: string;
  incidentRecoveryProfileCanonicalContractVersion: string;
  incidentRecoveryProfileExternalConsumerRegistryVersion: string;
  incidentRecoveryProfileExternalConsumerRegistryConfigVersion: string;
  incidentRecoveryProfileExternalConsumerRegistrySourceAdapterVersion: string;
  consumerCapabilityNegotiationVersion: string;
  governanceFederationVersion: string;
  governanceFederationConsensusVersion: string;
  governanceFederationPolicyPropagationVersion: string;
  governanceFederationLifecycleContinuityVersion: string;
  governanceFederationObservabilityVersion: string;
  governanceIntelligenceVersion: string;
  governanceAutonomousVersion: string;
  governanceSelfOptimizationVersion: string;
  governanceMetaGovernanceVersion: string;
}): GovernanceCapabilityVersionSnapshot[] {
  return [
    { capabilityId: "governance-rules", version: input.governanceRulesVersion },
    { capabilityId: "governance-rulebook", version: input.rulebookVersion },
    { capabilityId: "governance-policy-pack", version: input.policyPackVersion },
    { capabilityId: "governance-orchestration", version: input.orchestrationVersion },
    { capabilityId: "governance-lifecycle", version: input.lifecycleVersion },
    { capabilityId: "governance-persistence", version: input.persistenceVersion },
    { capabilityId: "governance-store", version: input.storeVersion },
    { capabilityId: "governance-recovery", version: input.recoveryVersion },
    { capabilityId: "incident-recovery-profile", version: input.incidentRecoveryProfileVersion },
    { capabilityId: "incident-recovery-profile-config", version: input.incidentRecoveryProfileConfigVersion },
    { capabilityId: "incident-recovery-profile-json-source", version: input.incidentRecoveryProfileJsonSourceVersion },
    { capabilityId: "incident-recovery-profile-json-schema-guard", version: input.incidentRecoveryProfileJsonSchemaGuardVersion },
    { capabilityId: "incident-recovery-profile-json-schema-evolution", version: input.incidentRecoveryProfileJsonSchemaEvolutionVersion },
    { capabilityId: "incident-recovery-profile-migration-rule-registry", version: input.incidentRecoveryProfileMigrationRuleRegistryVersion },
    { capabilityId: "incident-recovery-profile-rendering-policy", version: input.incidentRecoveryProfileRenderingPolicyVersion },
    { capabilityId: "incident-recovery-profile-migration-execution", version: input.incidentRecoveryProfileMigrationExecutionVersion },
    { capabilityId: "incident-recovery-profile-canonical-contract", version: input.incidentRecoveryProfileCanonicalContractVersion },
    { capabilityId: "incident-recovery-profile-external-consumer-registry", version: input.incidentRecoveryProfileExternalConsumerRegistryVersion },
    { capabilityId: "incident-recovery-profile-external-consumer-registry-config", version: input.incidentRecoveryProfileExternalConsumerRegistryConfigVersion },
    { capabilityId: "incident-recovery-profile-external-consumer-registry-source-adapter", version: input.incidentRecoveryProfileExternalConsumerRegistrySourceAdapterVersion },
    { capabilityId: "consumer-capability-negotiation", version: input.consumerCapabilityNegotiationVersion },
    { capabilityId: "governance-federation", version: input.governanceFederationVersion },
    { capabilityId: "governance-federation-consensus", version: input.governanceFederationConsensusVersion },
    { capabilityId: "governance-federation-policy-propagation", version: input.governanceFederationPolicyPropagationVersion },
    { capabilityId: "governance-federation-lifecycle-continuity", version: input.governanceFederationLifecycleContinuityVersion },
    { capabilityId: "governance-federation-observability", version: input.governanceFederationObservabilityVersion },
    { capabilityId: "governance-intelligence", version: input.governanceIntelligenceVersion },
    { capabilityId: "governance-autonomous", version: input.governanceAutonomousVersion },
    { capabilityId: "governance-self-optimization", version: input.governanceSelfOptimizationVersion },
    { capabilityId: "governance-meta-governance", version: input.governanceMetaGovernanceVersion },
  ];
}
