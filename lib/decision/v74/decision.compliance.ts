/**
 * V74 P7 — Decision compliance catalog types (read-only)
 */

export const V74_DECISION_COMPLIANCE_VERSION = "v74-decision-compliance-catalog-1" as const;
export const V74_DECISION_COMPLIANCE_FREEZE_VERSION =
  "v74-decision-compliance-catalog-freeze-1" as const;

export type ComplianceDomainKind =
  | "policyMatch"
  | "constraintMatch"
  | "contextIntegrity"
  | "evaluationIntegrity"
  | "simulationIntegrity"
  | "auditTrace"
  | "versionConsistency"
  | "rollbackReadiness";

export type ComplianceStatus = "passed" | "failed" | "pending" | "waived";

export type ComplianceValidation = {
  id: string;
  complianceRef: string;
  validationKind: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type ComplianceCatalogEntry = {
  id: string;
  domain: ComplianceDomainKind;
  purpose: string;
  inputs: string[];
  outputs: string[];
  criteria: string[];
  evidence: string;
  status: ComplianceStatus;
  validation: string;
  upstreamRef: string;
  required: boolean;
  description: string;
};

export type ComplianceCatalogManifest = {
  version: typeof V74_DECISION_COMPLIANCE_VERSION;
  entryCount: number;
  domainCount: number;
  catalogComplete: boolean;
  items: ComplianceCatalogEntry[];
  summary: string;
};

export type ComplianceValidationManifest = {
  version: typeof V74_DECISION_COMPLIANCE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  validations: ComplianceValidation[];
  summary: string;
};

export type DecisionComplianceCatalogSignals = {
  decisionSimulationCatalogReady?: boolean;
  catalogComplete?: boolean;
  validationsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type DecisionComplianceCatalogReport = {
  version: typeof V74_DECISION_COMPLIANCE_VERSION;
  freezeVersion: typeof V74_DECISION_COMPLIANCE_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  decisionSimulationCatalogVersion: string;
  decisionSimulationCatalogReady: boolean;
  catalog: ComplianceCatalogManifest;
  validations: ComplianceValidationManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
