/**
 * V77 P7 — Planning compliance catalog types (read-only)
 */

export const V77_PLANNING_COMPLIANCE_VERSION = "v77-planning-compliance-catalog-1" as const;
export const V77_PLANNING_COMPLIANCE_FREEZE_VERSION =
  "v77-planning-compliance-catalog-freeze-1" as const;

export type PlanningComplianceKind =
  | "shared"
  | "role"
  | "topology"
  | "scope"
  | "dependency"
  | "governance"
  | "workspace"
  | "boundary";

export type PlanningComplianceStatus = "passed" | "failed" | "pending" | "waived";

export type PlanningComplianceValidation = {
  id: string;
  complianceRef: string;
  validationKind: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type PlanningComplianceCatalogEntry = {
  id: string;
  kind: PlanningComplianceKind;
  purpose: string;
  rule: string;
  auditPoint: string;
  waiverCondition: string;
  roleRef: string;
  topologyRef: string;
  dependencyRef: string;
  criteria: string[];
  evidence: string;
  status: PlanningComplianceStatus;
  validation: string;
  upstreamRef: string;
  required: boolean;
  description: string;
};

export type PlanningComplianceCatalogManifest = {
  version: typeof V77_PLANNING_COMPLIANCE_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  items: PlanningComplianceCatalogEntry[];
  summary: string;
};

export type PlanningComplianceValidationManifest = {
  version: typeof V77_PLANNING_COMPLIANCE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  validations: PlanningComplianceValidation[];
  summary: string;
};

export type PlanningComplianceCatalogSignals = {
  planningSimulationCatalogReady?: boolean;
  catalogComplete?: boolean;
  validationsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type PlanningComplianceCatalogReport = {
  version: typeof V77_PLANNING_COMPLIANCE_VERSION;
  freezeVersion: typeof V77_PLANNING_COMPLIANCE_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  planningSimulationCatalogVersion: string;
  planningSimulationCatalogReady: boolean;
  catalog: PlanningComplianceCatalogManifest;
  validations: PlanningComplianceValidationManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
