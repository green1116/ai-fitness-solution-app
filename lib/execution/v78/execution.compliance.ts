/**
 * V78 P7 — Execution compliance catalog types (read-only)
 */

export const V78_EXECUTION_COMPLIANCE_VERSION = "v78-execution-compliance-catalog-1" as const;
export const V78_EXECUTION_COMPLIANCE_FREEZE_VERSION =
  "v78-execution-compliance-catalog-freeze-1" as const;

export type ExecutionComplianceKind =
  | "shared"
  | "role"
  | "topology"
  | "scope"
  | "dependency"
  | "governance"
  | "workspace"
  | "boundary";

export type ExecutionComplianceStatus = "passed" | "failed" | "pending" | "waived";

export type ExecutionComplianceValidation = {
  id: string;
  complianceRef: string;
  validationKind: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type ExecutionComplianceCatalogEntry = {
  id: string;
  kind: ExecutionComplianceKind;
  purpose: string;
  rule: string;
  auditPoint: string;
  waiverCondition: string;
  roleRef: string;
  topologyRef: string;
  dependencyRef: string;
  criteria: string[];
  evidence: string;
  status: ExecutionComplianceStatus;
  validation: string;
  upstreamRef: string;
  required: boolean;
  description: string;
};

export type ExecutionComplianceCatalogManifest = {
  version: typeof V78_EXECUTION_COMPLIANCE_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  items: ExecutionComplianceCatalogEntry[];
  summary: string;
};

export type ExecutionComplianceValidationManifest = {
  version: typeof V78_EXECUTION_COMPLIANCE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  validations: ExecutionComplianceValidation[];
  summary: string;
};

export type ExecutionComplianceCatalogSignals = {
  executionSimulationCatalogReady?: boolean;
  catalogComplete?: boolean;
  validationsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type ExecutionComplianceCatalogReport = {
  version: typeof V78_EXECUTION_COMPLIANCE_VERSION;
  freezeVersion: typeof V78_EXECUTION_COMPLIANCE_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  executionSimulationCatalogVersion: string;
  executionSimulationCatalogReady: boolean;
  catalog: ExecutionComplianceCatalogManifest;
  validations: ExecutionComplianceValidationManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
