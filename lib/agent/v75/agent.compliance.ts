/**
 * V75 P7 — Agent compliance catalog types (read-only)
 */

export const V75_AGENT_COMPLIANCE_VERSION = "v75-agent-compliance-catalog-1" as const;
export const V75_AGENT_COMPLIANCE_FREEZE_VERSION =
  "v75-agent-compliance-catalog-freeze-1" as const;

export type AgentComplianceDomainKind =
  | "policyMatch"
  | "constraintMatch"
  | "contextIntegrity"
  | "evaluationIntegrity"
  | "simulationIntegrity"
  | "auditTrace"
  | "versionConsistency"
  | "rollbackReadiness";

export type AgentComplianceStatus = "passed" | "failed" | "pending" | "waived";

export type AgentComplianceValidation = {
  id: string;
  complianceRef: string;
  validationKind: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type AgentComplianceCatalogEntry = {
  id: string;
  domain: AgentComplianceDomainKind;
  purpose: string;
  rule: string;
  auditPoint: string;
  waiverCondition: string;
  inputs: string[];
  outputs: string[];
  criteria: string[];
  evidence: string;
  status: AgentComplianceStatus;
  validation: string;
  upstreamRef: string;
  required: boolean;
  description: string;
};

export type AgentComplianceCatalogManifest = {
  version: typeof V75_AGENT_COMPLIANCE_VERSION;
  entryCount: number;
  domainCount: number;
  catalogComplete: boolean;
  items: AgentComplianceCatalogEntry[];
  summary: string;
};

export type AgentComplianceValidationManifest = {
  version: typeof V75_AGENT_COMPLIANCE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  validations: AgentComplianceValidation[];
  summary: string;
};

export type AgentComplianceCatalogSignals = {
  agentSimulationCatalogReady?: boolean;
  catalogComplete?: boolean;
  validationsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type AgentComplianceCatalogReport = {
  version: typeof V75_AGENT_COMPLIANCE_VERSION;
  freezeVersion: typeof V75_AGENT_COMPLIANCE_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  agentSimulationCatalogVersion: string;
  agentSimulationCatalogReady: boolean;
  catalog: AgentComplianceCatalogManifest;
  validations: AgentComplianceValidationManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
