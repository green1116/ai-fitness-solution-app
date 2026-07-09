/**
 * V66 P5 — Deployment security & compliance types (read-only)
 */

export const V66_DEPLOYMENT_SECURITY_VERSION = "v66-deployment-security-1" as const;

export type SecurityPolicySeverity = "critical" | "high" | "medium" | "low";

export type SecurityPolicyCategory =
  | "secrets"
  | "auth"
  | "network"
  | "compliance"
  | "integrity"
  | "upstream";

export type ComplianceStatus = "pass" | "fail" | "warn" | "na";

export type SecurityGateStatus = "open" | "closed" | "blocked";

export type DeploymentSecuritySignals = {
  orchestrationReady?: boolean;
  policyCatalogComplete?: boolean;
  complianceChecklistPass?: boolean;
  securityGatesPass?: boolean;
  artifactIntegrityComplete?: boolean;
};

export type SecurityPolicyDefinition = {
  id: string;
  label: string;
  category: SecurityPolicyCategory;
  severity: SecurityPolicySeverity;
  required: boolean;
  control: string;
  notes?: string;
};

export type SecurityPolicyManifest = {
  version: typeof V66_DEPLOYMENT_SECURITY_VERSION;
  policyCount: number;
  categoryCount: number;
  catalogComplete: boolean;
  policies: SecurityPolicyDefinition[];
  summary: string;
};

export type ComplianceChecklistItem = {
  id: string;
  label: string;
  status: ComplianceStatus;
  required: boolean;
  framework?: string;
  notes?: string;
};

export type ComplianceChecklistManifest = {
  version: typeof V66_DEPLOYMENT_SECURITY_VERSION;
  itemCount: number;
  passCount: number;
  checklistPass: boolean;
  items: ComplianceChecklistItem[];
  summary: string;
};

export type SecurityGateDefinition = {
  id: string;
  label: string;
  status: SecurityGateStatus;
  required: boolean;
  blocker: boolean;
  notes?: string;
};

export type SecurityGateManifest = {
  version: typeof V66_DEPLOYMENT_SECURITY_VERSION;
  gateCount: number;
  closedCount: number;
  gatesPass: boolean;
  gates: SecurityGateDefinition[];
  summary: string;
};

export type ArtifactIntegrityEntry = {
  id: string;
  path: string;
  kind: "lockfile" | "schema" | "module" | "config" | "script" | "doc";
  required: boolean;
  integrityCheck: "presence" | "catalog" | "frozen-reference";
  description: string;
};

export type ArtifactIntegrityManifest = {
  version: typeof V66_DEPLOYMENT_SECURITY_VERSION;
  entryCount: number;
  requiredCount: number;
  integrityComplete: boolean;
  entries: ArtifactIntegrityEntry[];
  summary: string;
};

export type DeploymentSecurityReport = {
  version: typeof V66_DEPLOYMENT_SECURITY_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  orchestrationVersion: string;
  orchestrationReady: boolean;
  securityPolicies: SecurityPolicyManifest;
  complianceChecklist: ComplianceChecklistManifest;
  securityGates: SecurityGateManifest;
  artifactIntegrity: ArtifactIntegrityManifest;
  securityReady: boolean;
  readinessScore: number;
  summary: string;
};
