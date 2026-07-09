/**
 * V76 P7 — Collaboration compliance catalog types (read-only)
 */

export const V76_COLLABORATION_COMPLIANCE_VERSION =
  "v76-collaboration-compliance-catalog-1" as const;
export const V76_COLLABORATION_COMPLIANCE_FREEZE_VERSION =
  "v76-collaboration-compliance-catalog-freeze-1" as const;

export type CollaborationComplianceKind =
  | "shared"
  | "topology"
  | "communication"
  | "delegation"
  | "coordination"
  | "governance"
  | "workspace"
  | "boundary";

export type CollaborationComplianceStatus = "passed" | "failed" | "pending" | "waived";

export type CollaborationComplianceValidation = {
  id: string;
  complianceRef: string;
  validationKind: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type CollaborationComplianceCatalogEntry = {
  id: string;
  kind: CollaborationComplianceKind;
  purpose: string;
  rule: string;
  auditPoint: string;
  waiverCondition: string;
  inputs: string[];
  outputs: string[];
  criteria: string[];
  evidence: string;
  status: CollaborationComplianceStatus;
  validation: string;
  upstreamRef: string;
  required: boolean;
  description: string;
};

export type CollaborationComplianceCatalogManifest = {
  version: typeof V76_COLLABORATION_COMPLIANCE_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  items: CollaborationComplianceCatalogEntry[];
  summary: string;
};

export type CollaborationComplianceValidationManifest = {
  version: typeof V76_COLLABORATION_COMPLIANCE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  validations: CollaborationComplianceValidation[];
  summary: string;
};

export type CollaborationComplianceCatalogSignals = {
  collaborationSimulationCatalogReady?: boolean;
  catalogComplete?: boolean;
  validationsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type CollaborationComplianceCatalogReport = {
  version: typeof V76_COLLABORATION_COMPLIANCE_VERSION;
  freezeVersion: typeof V76_COLLABORATION_COMPLIANCE_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  collaborationSimulationCatalogVersion: string;
  collaborationSimulationCatalogReady: boolean;
  catalog: CollaborationComplianceCatalogManifest;
  validations: CollaborationComplianceValidationManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
