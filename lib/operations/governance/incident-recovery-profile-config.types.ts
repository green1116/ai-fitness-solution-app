import type {
  GovernanceIncidentRecoveryProfile,
  GovernanceIncidentRecoveryProfileDecision,
  GovernanceIncidentRecoveryProfileResult,
} from "./incident-recovery-profile.types";

export const GOVERNANCE_INCIDENT_RECOVERY_PROFILE_CONFIG_VERSION =
  "v4-a3-r9.1-incident-recovery-profile-config-1" as const;
export type GovernanceIncidentRecoveryProfileConfigVersion =
  typeof GOVERNANCE_INCIDENT_RECOVERY_PROFILE_CONFIG_VERSION;

export type GovernanceIncidentRecoveryProfileConfigSourceType =
  | "inline"
  | "jsonLocal"
  | "env"
  | "builtinFallback"
  | "db"
  | "remote";

export type GovernanceIncidentRecoveryProfileConfigMergeStrategy =
  | "override"
  | "extend"
  | "fallback"
  | "priorityMerge";

export type GovernanceIncidentRecoveryProfileConfigStatus =
  | "resolved"
  | "fallback"
  | "invalidExternalConfig";

export type GovernanceIncidentRecoveryProfileConfigSource = {
  sourceId: string;
  type: GovernanceIncidentRecoveryProfileConfigSourceType;
  enabled: boolean;
  priority: number;
  profileVersion: string;
  mergeStrategy: GovernanceIncidentRecoveryProfileConfigMergeStrategy;
  inlineProfiles: GovernanceIncidentRecoveryProfile[];
  description: string;
};

export type GovernanceIncidentRecoveryProfileConfigAdapter = {
  adapterId: string;
  adapted: boolean;
  normalizedProfiles: GovernanceIncidentRecoveryProfile[];
  warnings: string[];
};

export type GovernanceIncidentRecoveryProfileConfigResolver = {
  resolverId: string;
  selectedSourceId: string;
  selectedProfileId: string;
  resolvedFrom: "external" | "builtin";
  decision: GovernanceIncidentRecoveryProfileDecision;
};

export type GovernanceIncidentRecoveryProfileConfigRegistry = {
  version: GovernanceIncidentRecoveryProfileConfigVersion;
  sources: GovernanceIncidentRecoveryProfileConfigSource[];
  mergeStrategies: GovernanceIncidentRecoveryProfileConfigMergeStrategy[];
};

export type GovernanceIncidentRecoveryProfileConfigTrace = {
  traceId: string;
  loading: string[];
  adaptation: string[];
  merge: string[];
  resolution: string[];
  fallbackUsed: boolean;
};

export type GovernanceIncidentRecoveryProfileConfigSummary = {
  summaryId: string;
  text: string;
  traceId: string;
};

export type GovernanceIncidentRecoveryProfileConfigSnapshot = {
  sourceType: GovernanceIncidentRecoveryProfileConfigSourceType;
  profileVersion: string;
  selectedProfileId: string;
  mergedCount: number;
  fallbackUsed: boolean;
};

export type GovernanceIncidentRecoveryProfileConfigInput = {
  deploymentId: string;
  incidentRecoveryProfile: GovernanceIncidentRecoveryProfileResult;
  inlineConfig?: {
    sourceType?: GovernanceIncidentRecoveryProfileConfigSourceType;
    profileVersion: string;
    mergeStrategy: GovernanceIncidentRecoveryProfileConfigMergeStrategy;
    profiles: GovernanceIncidentRecoveryProfile[];
  };
};

export type GovernanceIncidentRecoveryProfileConfigResult = {
  version: GovernanceIncidentRecoveryProfileConfigVersion;
  status: GovernanceIncidentRecoveryProfileConfigStatus;
  snapshot: GovernanceIncidentRecoveryProfileConfigSnapshot;
  source: GovernanceIncidentRecoveryProfileConfigSource;
  resolved: GovernanceIncidentRecoveryProfileConfigResolver;
  merged: GovernanceIncidentRecoveryProfile[];
  registry: GovernanceIncidentRecoveryProfileConfigRegistry;
  trace: GovernanceIncidentRecoveryProfileConfigTrace;
  summary: GovernanceIncidentRecoveryProfileConfigSummary;
};
