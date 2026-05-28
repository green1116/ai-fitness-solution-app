import type { GovernanceIncidentRecoveryProfileMigrationExecutionCanonical } from "./incident-recovery-profile-migration-execution.types";

export const GOVERNANCE_INCIDENT_RECOVERY_PROFILE_CANONICAL_CONTRACT_VERSION =
  "v4-a3-r9.1.6-incident-recovery-profile-canonical-contract-1" as const;
export type GovernanceIncidentRecoveryProfileCanonicalContractVersion =
  typeof GOVERNANCE_INCIDENT_RECOVERY_PROFILE_CANONICAL_CONTRACT_VERSION;

export type GovernanceIncidentRecoveryProfileCanonicalContractConsumerVersion = "v1" | "v2";

export type GovernanceIncidentRecoveryProfileCanonicalContractCompatibilityStatus =
  | "compatible"
  | "compatibleWithWarnings"
  | "incompatible"
  | "fallbackCompatible";

export type GovernanceIncidentRecoveryProfileCanonicalContractCompatibility = {
  consumerId: string;
  consumerVersion: GovernanceIncidentRecoveryProfileCanonicalContractConsumerVersion;
  status: GovernanceIncidentRecoveryProfileCanonicalContractCompatibilityStatus;
  missingRequiredFields: string[];
  warnings: string[];
  fallbackReason: string | null;
};

export type GovernanceIncidentRecoveryProfileCanonicalContract = {
  contractId: string;
  contractVersion: GovernanceIncidentRecoveryProfileCanonicalContractVersion;
  canonicalVersion: string;
  requiredFields: string[];
  optionalFields: string[];
};

export type GovernanceIncidentRecoveryProfileCanonicalContractConsumer = {
  consumerId:
    | "recovery-consumer"
    | "audit-consumer"
    | "rendering-consumer"
    | "registry-consumer"
    | "reporting-consumer"
    | "external-integration-consumer";
  consumerVersion: GovernanceIncidentRecoveryProfileCanonicalContractConsumerVersion;
  requiredFields: string[];
  optionalFields: string[];
  mode: "strict" | "compat" | "lenient" | "audit";
};

export type GovernanceIncidentRecoveryProfileCanonicalContractMatrix = {
  matrixId: string;
  entries: GovernanceIncidentRecoveryProfileCanonicalContractCompatibility[];
};

export type GovernanceIncidentRecoveryProfileCanonicalContractReport = {
  reportId: string;
  contractVersion: string;
  consumerCount: number;
  compatibleCount: number;
  warningCount: number;
  incompatibleCount: number;
  fallbackCompatibleCount: number;
  details: string[];
};

export type GovernanceIncidentRecoveryProfileCanonicalContractTrace = {
  traceId: string;
  loading: string[];
  validation: string[];
  compatibility: string[];
  fallback: string[];
};

export type GovernanceIncidentRecoveryProfileCanonicalContractSummary = {
  summaryId: string;
  text: string;
  traceId: string;
};

export type GovernanceIncidentRecoveryProfileCanonicalContractInput = {
  deploymentId: string;
  canonicalPayload: GovernanceIncidentRecoveryProfileMigrationExecutionCanonical;
};

export type GovernanceIncidentRecoveryProfileCanonicalContractResult = {
  version: GovernanceIncidentRecoveryProfileCanonicalContractVersion;
  snapshot: GovernanceIncidentRecoveryProfileCanonicalContract;
  consumer: GovernanceIncidentRecoveryProfileCanonicalContractConsumer["consumerId"];
  consumerVersion: GovernanceIncidentRecoveryProfileCanonicalContractConsumerVersion;
  compatibility: GovernanceIncidentRecoveryProfileCanonicalContractCompatibility;
  matrix: GovernanceIncidentRecoveryProfileCanonicalContractMatrix;
  report: GovernanceIncidentRecoveryProfileCanonicalContractReport;
  trace: GovernanceIncidentRecoveryProfileCanonicalContractTrace;
  summary: GovernanceIncidentRecoveryProfileCanonicalContractSummary;
  status: GovernanceIncidentRecoveryProfileCanonicalContractCompatibilityStatus;
};
