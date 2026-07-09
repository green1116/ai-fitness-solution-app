/**
 * V79 P7 — Task compliance catalog types (read-only)
 */

export const V79_TASK_COMPLIANCE_VERSION = "v79-task-compliance-catalog-1" as const;
export const V79_TASK_COMPLIANCE_FREEZE_VERSION =
  "v79-task-compliance-catalog-freeze-1" as const;

export type TaskComplianceKind =
  | "shared"
  | "role"
  | "state"
  | "topology"
  | "scope"
  | "dependency"
  | "governance"
  | "boundary";

export type TaskComplianceStatus = "passed" | "failed" | "pending" | "waived";

export type TaskComplianceValidation = {
  id: string;
  complianceRef: string;
  validationKind: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type TaskComplianceCatalogEntry = {
  id: string;
  kind: TaskComplianceKind;
  purpose: string;
  rule: string;
  auditPoint: string;
  waiverCondition: string;
  roleRef: string;
  stateRef: string;
  topologyRef: string;
  dependencyRef: string;
  criteria: string[];
  evidence: string;
  status: TaskComplianceStatus;
  validation: string;
  upstreamRef: string;
  required: boolean;
  description: string;
};

export type TaskComplianceCatalogManifest = {
  version: typeof V79_TASK_COMPLIANCE_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  items: TaskComplianceCatalogEntry[];
  summary: string;
};

export type TaskComplianceValidationManifest = {
  version: typeof V79_TASK_COMPLIANCE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  validations: TaskComplianceValidation[];
  summary: string;
};

export type TaskComplianceCatalogSignals = {
  taskSimulationCatalogReady?: boolean;
  catalogComplete?: boolean;
  validationsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type TaskComplianceCatalogReport = {
  version: typeof V79_TASK_COMPLIANCE_VERSION;
  freezeVersion: typeof V79_TASK_COMPLIANCE_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  taskSimulationCatalogVersion: string;
  taskSimulationCatalogReady: boolean;
  catalog: TaskComplianceCatalogManifest;
  validations: TaskComplianceValidationManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
