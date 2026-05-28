import type { GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer } from "./incident-recovery-profile-external-consumer-registry.types";

export const GOVERNANCE_INCIDENT_RECOVERY_PROFILE_EXTERNAL_CONSUMER_REGISTRY_CONFIG_VERSION =
  "v4-a3-r9.1.8-incident-recovery-profile-external-consumer-registry-config-1" as const;
export type GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigVersion =
  typeof GOVERNANCE_INCIDENT_RECOVERY_PROFILE_EXTERNAL_CONSUMER_REGISTRY_CONFIG_VERSION;

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigSourceType =
  | "inline"
  | "localJson"
  | "file"
  | "env"
  | "builtinFallback"
  | "db"
  | "remote";

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigMergeStrategy =
  | "override"
  | "extend"
  | "fallback"
  | "priorityMerge";

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigStatus =
  | "resolved"
  | "fallback"
  | "invalidExternalConfig";

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigSource = {
  sourceId: string;
  type: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigSourceType;
  configVersion: string;
  mergeStrategy: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigMergeStrategy;
  consumers: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer[];
};

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigSnapshot = {
  sourceType: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigSourceType;
  configVersion: string;
  consumerCount: number;
  fallbackUsed: boolean;
};

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigRegistry = {
  version: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigVersion;
  sources: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigSourceType[];
  mergeStrategies: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigMergeStrategy[];
};

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigTrace = {
  traceId: string;
  loading: string[];
  merge: string[];
  resolution: string[];
  fallbackUsed: boolean;
};

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigSummary = {
  summaryId: string;
  text: string;
  traceId: string;
};

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigCompatibility = {
  status: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigStatus;
  fallbackUsed: boolean;
  consumerCount: number;
};

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigReport = {
  reportId: string;
  sourceType: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigSourceType;
  consumerCount: number;
  status: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigStatus;
};

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigResolvedInput = {
  useAdapterSource: boolean;
  fallbackToBuiltin: boolean;
  resolvedSourceType: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigSourceType;
  configVersion: string;
  mergeStrategy: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigMergeStrategy;
  consumers: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer[];
};

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigInput = {
  deploymentId: string;
  sourceAdapterResolved: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigResolvedInput;
  inlineConfig?: {
    sourceType?: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigSourceType;
    configVersion: string;
    mergeStrategy: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigMergeStrategy;
    consumers: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer[];
  };
};

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigResult = {
  version: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigVersion;
  snapshot: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigSnapshot;
  source: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigSource;
  mergedConsumers: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer[];
  resolvedConsumer: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer;
  compatibility: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigCompatibility;
  registry: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigRegistry;
  trace: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigTrace;
  summary: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigSummary;
  report: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigReport;
  status: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigStatus;
};
