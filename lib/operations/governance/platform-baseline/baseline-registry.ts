import type { GovernanceCapabilityCatalogEntry } from "./baseline-types";

export const GOVERNANCE_PLATFORM_CAPABILITY_CATALOG: GovernanceCapabilityCatalogEntry[] = [
  { capabilityId: "governance-rules", releaseTag: "R1", label: "Rules Runtime", tier: "core", capabilityClass: "foundation", dependsOn: [] },
  { capabilityId: "governance-rulebook", releaseTag: "R2", label: "Rulebook Runtime", tier: "core", capabilityClass: "foundation", dependsOn: ["governance-rules"] },
  { capabilityId: "governance-policy-pack", releaseTag: "R3", label: "Policy Pack Runtime", tier: "core", capabilityClass: "foundation", dependsOn: ["governance-rulebook"] },
  { capabilityId: "governance-orchestration", releaseTag: "R4", label: "Orchestration Runtime", tier: "core", capabilityClass: "execution", dependsOn: ["governance-policy-pack"] },
  { capabilityId: "governance-lifecycle", releaseTag: "R5", label: "Lifecycle Runtime", tier: "core", capabilityClass: "execution", dependsOn: ["governance-orchestration"] },
  { capabilityId: "governance-persistence", releaseTag: "R6", label: "Persistence Runtime", tier: "core", capabilityClass: "persistence", dependsOn: ["governance-lifecycle"] },
  { capabilityId: "governance-store", releaseTag: "R7", label: "Store Adapter Runtime", tier: "core", capabilityClass: "persistence", dependsOn: ["governance-persistence"] },
  { capabilityId: "governance-recovery", releaseTag: "R8", label: "Recovery Runtime", tier: "core", capabilityClass: "recovery", dependsOn: ["governance-store"] },
  { capabilityId: "incident-recovery-profile", releaseTag: "R9", label: "Incident Recovery Profile Runtime", tier: "incident-profile", capabilityClass: "recovery", dependsOn: ["governance-recovery"] },
  { capabilityId: "incident-recovery-profile-config", releaseTag: "R9.1", label: "Incident Recovery Profile Config Runtime", tier: "incident-profile", capabilityClass: "recovery", dependsOn: ["incident-recovery-profile"] },
  { capabilityId: "incident-recovery-profile-json-source", releaseTag: "R9.1.1", label: "Incident Profile JSON Source Runtime", tier: "incident-profile", capabilityClass: "integration", dependsOn: ["incident-recovery-profile-config"] },
  { capabilityId: "incident-recovery-profile-json-schema-guard", releaseTag: "R9.1.2", label: "Incident Profile JSON Schema Guard", tier: "incident-profile", capabilityClass: "integration", dependsOn: ["incident-recovery-profile-json-source"] },
  { capabilityId: "incident-recovery-profile-json-schema-evolution", releaseTag: "R9.1.3", label: "Incident Profile JSON Schema Evolution", tier: "incident-profile", capabilityClass: "integration", dependsOn: ["incident-recovery-profile-json-schema-guard"] },
  { capabilityId: "incident-recovery-profile-migration-rule-registry", releaseTag: "R9.1.4", label: "Incident Profile Migration Rule Registry", tier: "incident-profile", capabilityClass: "integration", dependsOn: ["incident-recovery-profile-json-schema-evolution"] },
  { capabilityId: "incident-recovery-profile-rendering-policy", releaseTag: "R9.1.4", label: "Incident Profile Rendering Policy", tier: "incident-profile", capabilityClass: "integration", dependsOn: ["incident-recovery-profile-migration-rule-registry"] },
  { capabilityId: "incident-recovery-profile-migration-execution", releaseTag: "R9.1.5", label: "Incident Profile Migration Execution", tier: "incident-profile", capabilityClass: "integration", dependsOn: ["incident-recovery-profile-rendering-policy"] },
  { capabilityId: "incident-recovery-profile-canonical-contract", releaseTag: "R9.1.6", label: "Incident Profile Canonical Contract", tier: "incident-profile", capabilityClass: "integration", dependsOn: ["incident-recovery-profile-migration-execution"] },
  { capabilityId: "incident-recovery-profile-external-consumer-registry", releaseTag: "R9.1.7", label: "External Consumer Registry", tier: "incident-profile", capabilityClass: "integration", dependsOn: ["incident-recovery-profile-canonical-contract"] },
  { capabilityId: "incident-recovery-profile-external-consumer-registry-config", releaseTag: "R9.1.8", label: "External Consumer Registry Config", tier: "incident-profile", capabilityClass: "integration", dependsOn: ["incident-recovery-profile-external-consumer-registry"] },
  { capabilityId: "incident-recovery-profile-external-consumer-registry-source-adapter", releaseTag: "R9.1.9", label: "External Consumer Registry Source Adapter", tier: "incident-profile", capabilityClass: "integration", dependsOn: ["incident-recovery-profile-external-consumer-registry-config"] },
  { capabilityId: "consumer-capability-negotiation", releaseTag: "R9.2", label: "Capability Negotiation Runtime", tier: "federation", capabilityClass: "coordination", dependsOn: ["incident-recovery-profile-external-consumer-registry-source-adapter"] },
  { capabilityId: "governance-federation", releaseTag: "R9.3", label: "Federation Runtime", tier: "federation", capabilityClass: "coordination", dependsOn: ["consumer-capability-negotiation"] },
  { capabilityId: "governance-federation-consensus", releaseTag: "R9.4", label: "Federation Consensus Runtime", tier: "federation", capabilityClass: "coordination", dependsOn: ["governance-federation"] },
  { capabilityId: "governance-federation-policy-propagation", releaseTag: "R9.5", label: "Federation Policy Propagation Runtime", tier: "federation", capabilityClass: "coordination", dependsOn: ["governance-federation-consensus"] },
  { capabilityId: "governance-federation-lifecycle-continuity", releaseTag: "R9.6", label: "Federation Lifecycle Continuity Runtime", tier: "federation", capabilityClass: "coordination", dependsOn: ["governance-federation-policy-propagation"] },
  { capabilityId: "governance-federation-observability", releaseTag: "R10", label: "Federation Observability Runtime", tier: "observability", capabilityClass: "observation", dependsOn: ["governance-federation-lifecycle-continuity"] },
  { capabilityId: "governance-intelligence", releaseTag: "R11", label: "Governance Intelligence Runtime", tier: "intelligence", capabilityClass: "cognition", dependsOn: ["governance-federation-observability"] },
  { capabilityId: "governance-autonomous", releaseTag: "R12", label: "Governance Autonomous Runtime", tier: "autonomous", capabilityClass: "automation", dependsOn: ["governance-intelligence"] },
  { capabilityId: "governance-self-optimization", releaseTag: "R13", label: "Governance Self-Optimization Runtime", tier: "optimization", capabilityClass: "evolution", dependsOn: ["governance-autonomous"] },
  { capabilityId: "governance-meta-governance", releaseTag: "R14", label: "Governance Meta-Governance Runtime", tier: "meta", capabilityClass: "governance-meta", dependsOn: ["governance-self-optimization"] },
];

export const GOVERNANCE_PLATFORM_BASELINE_VERIFY_GROUPS = [
  "operational-governance",
  "governance-meta-governance",
  "governance-self-optimization",
  "governance-autonomous",
  "governance-intelligence",
  "federation-observability",
  "federation-lifecycle-continuity",
  "federation-policy-propagation",
  "federation-consensus",
  "federation-runtime",
  "consumer-capability-negotiation",
] as const;

export function computeManifestDigest(versions: string[]): string {
  let hash = 0;
  const joined = versions.sort().join("|");
  for (let i = 0; i < joined.length; i += 1) {
    hash = (hash * 31 + joined.charCodeAt(i)) >>> 0;
  }
  return `baseline-${hash.toString(16).padStart(8, "0")}`;
}
