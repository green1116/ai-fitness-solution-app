import type {
  GovernanceIncidentRecoveryProfileCanonicalContractCompatibility,
  GovernanceIncidentRecoveryProfileCanonicalContractResult,
} from "./incident-recovery-profile-canonical-contract.types";

export const GOVERNANCE_INCIDENT_RECOVERY_PROFILE_EXTERNAL_CONSUMER_REGISTRY_VERSION =
  "v4-a3-r9.1.7-incident-recovery-profile-external-consumer-registry-1" as const;
export type GovernanceIncidentRecoveryProfileExternalConsumerRegistryVersion =
  typeof GOVERNANCE_INCIDENT_RECOVERY_PROFILE_EXTERNAL_CONSUMER_REGISTRY_VERSION;

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumerVersion = "v1" | "v2";
export type GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumerCategory =
  | "recovery"
  | "audit"
  | "rendering"
  | "registry"
  | "reporting"
  | "integration"
  | "api"
  | "partner";
export type GovernanceIncidentRecoveryProfileExternalConsumerRegistryStatus =
  | "resolved"
  | "fallback"
  | "incompatible";

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer = {
  consumerId: string;
  consumerName: string;
  consumerVersion: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumerVersion;
  enabled: boolean;
  priority: number;
  category: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumerCategory;
  requiredFields: string[];
  optionalFields: string[];
  fallbackPolicy: "builtin" | "compat" | "none";
  compatibilityTarget: "strict" | "compat" | "lenient" | "audit";
  description: string;
  owner: string;
  source: "builtin" | "external";
};

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistry = {
  registryId: string;
  registryVersion: GovernanceIncidentRecoveryProfileExternalConsumerRegistryVersion;
  consumers: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer[];
};

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumerMatch = {
  consumerId: string;
  matched: boolean;
  reason: string;
};

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumerCompatibility = {
  consumerId: string;
  status: GovernanceIncidentRecoveryProfileExternalConsumerRegistryStatus | "compatibleWithWarnings";
  missingRequiredFields: string[];
  warnings: string[];
  fallbackReason: string | null;
};

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistryTrace = {
  traceId: string;
  registration: string[];
  resolution: string[];
  compatibility: string[];
  fallback: string[];
};

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistrySummary = {
  summaryId: string;
  text: string;
  traceId: string;
};

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistryReport = {
  reportId: string;
  consumerCount: number;
  enabledCount: number;
  compatibilityStatus: string;
  details: string[];
};

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistryInput = {
  deploymentId: string;
  canonicalContract: GovernanceIncidentRecoveryProfileCanonicalContractResult;
  requestedConsumerId?: string;
  externalConsumers?: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer[];
};

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistryResult = {
  version: GovernanceIncidentRecoveryProfileExternalConsumerRegistryVersion;
  snapshot: GovernanceIncidentRecoveryProfileExternalConsumerRegistry;
  consumers: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer[];
  resolvedConsumer: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer;
  compatibility: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumerCompatibility;
  canonicalCompatibility: GovernanceIncidentRecoveryProfileCanonicalContractCompatibility;
  trace: GovernanceIncidentRecoveryProfileExternalConsumerRegistryTrace;
  summary: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySummary;
  report: GovernanceIncidentRecoveryProfileExternalConsumerRegistryReport;
  status: GovernanceIncidentRecoveryProfileExternalConsumerRegistryStatus;
  matches: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumerMatch[];
};
