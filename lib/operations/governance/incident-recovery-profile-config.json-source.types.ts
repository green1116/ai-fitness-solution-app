import type {
  GovernanceIncidentRecoveryProfile,
  GovernanceIncidentRecoveryProfileDecision,
} from "./incident-recovery-profile.types";
import type { GovernanceIncidentRecoveryProfileConfigMergeStrategy } from "./incident-recovery-profile-config.types";

export const GOVERNANCE_INCIDENT_RECOVERY_PROFILE_JSON_SOURCE_VERSION =
  "v4-a3-r9.1.1-incident-recovery-profile-json-source-1" as const;
export type GovernanceIncidentRecoveryProfileJsonSourceVersion =
  typeof GOVERNANCE_INCIDENT_RECOVERY_PROFILE_JSON_SOURCE_VERSION;

export type GovernanceIncidentRecoveryProfileJsonSourceStatus =
  | "loaded"
  | "fallback"
  | "invalid";

export type GovernanceIncidentRecoveryProfileJsonSourceFile = {
  path: string;
  exists: boolean;
  content: string;
};

export type GovernanceIncidentRecoveryProfileJsonSourceSchema = {
  version: string;
  source: {
    name: string;
    owner: string;
    updatedAt: string;
  };
  mergeStrategy: GovernanceIncidentRecoveryProfileConfigMergeStrategy;
  profiles: GovernanceIncidentRecoveryProfile[];
};

export type GovernanceIncidentRecoveryProfileJsonSourceLoadResult = {
  loaded: boolean;
  file: GovernanceIncidentRecoveryProfileJsonSourceFile;
  error: string | null;
};

export type GovernanceIncidentRecoveryProfileJsonSourceValidation = {
  valid: boolean;
  errors: string[];
};

export type GovernanceIncidentRecoveryProfileJsonSourceMergeResult = {
  mergedProfiles: GovernanceIncidentRecoveryProfile[];
  conflicts: string[];
  overrideHit: boolean;
};

export type GovernanceIncidentRecoveryProfileJsonSourceResolveResult = {
  useJsonSource: boolean;
  fallbackToBuiltin: boolean;
  decision: GovernanceIncidentRecoveryProfileDecision;
};

export type GovernanceIncidentRecoveryProfileJsonSourceTrace = {
  traceId: string;
  load: string[];
  parse: string[];
  validate: string[];
  merge: string[];
  resolve: string[];
  fallback: string[];
};

export type GovernanceIncidentRecoveryProfileJsonSourceSummary = {
  summaryId: string;
  text: string;
  traceId: string;
};

export type GovernanceIncidentRecoveryProfileJsonSource = {
  path: string;
  schemaVersion: string;
  sourceName: string;
};

export type GovernanceIncidentRecoveryProfileJsonSourceInput = {
  deploymentId: string;
  jsonPath?: string;
  builtinProfiles: GovernanceIncidentRecoveryProfile[];
  builtinDecision: GovernanceIncidentRecoveryProfileDecision;
};

export type GovernanceIncidentRecoveryProfileJsonSourceResult = {
  version: GovernanceIncidentRecoveryProfileJsonSourceVersion;
  path: string;
  snapshot: GovernanceIncidentRecoveryProfileJsonSource;
  loaded: GovernanceIncidentRecoveryProfileJsonSourceLoadResult;
  validated: GovernanceIncidentRecoveryProfileJsonSourceValidation;
  resolved: GovernanceIncidentRecoveryProfileJsonSourceResolveResult;
  merged: GovernanceIncidentRecoveryProfileJsonSourceMergeResult;
  trace: GovernanceIncidentRecoveryProfileJsonSourceTrace;
  summary: GovernanceIncidentRecoveryProfileJsonSourceSummary;
  status: GovernanceIncidentRecoveryProfileJsonSourceStatus;
  parsedSchema: GovernanceIncidentRecoveryProfileJsonSourceSchema | null;
};
