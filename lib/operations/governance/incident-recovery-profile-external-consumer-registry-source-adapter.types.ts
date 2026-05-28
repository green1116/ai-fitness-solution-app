import type {
  GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigMergeStrategy,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigSourceType,
} from "./incident-recovery-profile-external-consumer-registry-config.types";
import type { GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer } from "./incident-recovery-profile-external-consumer-registry.types";

export const GOVERNANCE_INCIDENT_RECOVERY_PROFILE_EXTERNAL_CONSUMER_REGISTRY_SOURCE_ADAPTER_VERSION =
  "v4-a3-r9.1.9-incident-recovery-profile-external-consumer-registry-source-adapter-1" as const;
export type GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterVersion =
  typeof GOVERNANCE_INCIDENT_RECOVERY_PROFILE_EXTERNAL_CONSUMER_REGISTRY_SOURCE_ADAPTER_VERSION;

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterType =
  | "inline"
  | "localJson"
  | "file"
  | "env"
  | "db"
  | "remote";

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterStatus =
  | "loaded"
  | "fallback"
  | "invalid";

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterSource = {
  sourceId: string;
  type: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterType;
  identifier: string;
};

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterLoadResult = {
  loaded: boolean;
  path: string;
  rawPayload: string;
  error: string | null;
};

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterSchema = {
  version: string;
  source: { name: string; owner: string; updatedAt: string };
  mergeStrategy: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigMergeStrategy;
  consumers: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer[];
};

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterParseResult = {
  parsed: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterSchema | null;
  error: string | null;
};

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterValidation = {
  valid: boolean;
  errors: string[];
};

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterResolveResult = {
  useAdapterSource: boolean;
  fallbackToBuiltin: boolean;
  resolvedSourceType: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigSourceType;
  configVersion: string;
  mergeStrategy: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigMergeStrategy;
  consumers: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer[];
};

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapter = {
  adapterId: string;
  version: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterVersion;
  activeSourceType: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterType;
};

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterTrace = {
  traceId: string;
  load: string[];
  parse: string[];
  validate: string[];
  resolve: string[];
  fallback: string[];
};

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterSummary = {
  summaryId: string;
  text: string;
  traceId: string;
};

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterReport = {
  reportId: string;
  activeSource: string;
  resolvedSource: string;
  consumerCount: number;
  fallbackUsed: boolean;
  details: string[];
};

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterInput = {
  deploymentId: string;
  sourceType?: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterType;
  sourcePath?: string;
  inlineConfig?: {
    configVersion: string;
    mergeStrategy: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigMergeStrategy;
    consumers: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer[];
  };
};

export type GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterResult = {
  version: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterVersion;
  snapshot: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapter;
  source: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterSource;
  loaded: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterLoadResult;
  validated: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterValidation;
  resolved: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterResolveResult;
  trace: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterTrace;
  summary: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterSummary;
  report: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterReport;
  status: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterStatus;
  parsedSchema: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterSchema | null;
};
