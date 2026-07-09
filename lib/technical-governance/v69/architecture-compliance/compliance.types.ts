/**
 * V69 P7 — Architecture compliance types (read-only)
 */

export const V69_ARCHITECTURE_COMPLIANCE_VERSION = "v69-architecture-compliance-1" as const;
export const V69_ARCHITECTURE_COMPLIANCE_FREEZE_VERSION =
  "v69-architecture-compliance-freeze-1" as const;

export type ComplianceRuleKind =
  | "structural"
  | "standard"
  | "alignment"
  | "gate"
  | "deviation"
  | "exception";

export type ComplianceCheckKind = "manifest" | "alignment" | "verify" | "registry" | "freeze";

export type ComplianceGateKind = "verify" | "compile" | "alignment" | "readiness" | "manifest";

export type AlignmentLayer =
  | "P1-architecture"
  | "P2-dependency"
  | "P3-code"
  | "P4-standards"
  | "P5-security"
  | "P6-quality"
  | "P7-compliance";

export type DeviationSeverity = "blocker" | "critical" | "major" | "minor";

export type ExceptionStatus = "pending" | "approved" | "rejected" | "expired";

export type ArchitectureComplianceSignals = {
  qualityGovernanceReady?: boolean;
  objectCatalogComplete?: boolean;
  ruleCatalogComplete?: boolean;
  checkCatalogComplete?: boolean;
  gateCatalogComplete?: boolean;
  alignmentChecksComplete?: boolean;
  deviationCatalogComplete?: boolean;
  exceptionCatalogComplete?: boolean;
  refsAligned?: boolean;
  freezeLockIntact?: boolean;
};

export type ComplianceObject = {
  id: string;
  arcDefRef: string;
  qualityObjectRef: string;
  standardPolicyRef: string;
  name: string;
  required: boolean;
  description: string;
};

export type ComplianceObjectManifest = {
  version: typeof V69_ARCHITECTURE_COMPLIANCE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  objects: ComplianceObject[];
  summary: string;
};

export type ComplianceRuleEntry = {
  id: string;
  kind: ComplianceRuleKind;
  complianceObjectRef: string;
  criterion: string;
  enforceLevel: "required" | "recommended";
  required: boolean;
  description: string;
};

export type ComplianceRuleManifest = {
  version: typeof V69_ARCHITECTURE_COMPLIANCE_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  rules: ComplianceRuleEntry[];
  summary: string;
};

export type ComplianceCheckEntry = {
  id: string;
  complianceRuleRef: string;
  checkKind: ComplianceCheckKind;
  passCondition: string;
  required: boolean;
  description: string;
};

export type ComplianceCheckManifest = {
  version: typeof V69_ARCHITECTURE_COMPLIANCE_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  checks: ComplianceCheckEntry[];
  summary: string;
};

export type ComplianceGateEntry = {
  id: string;
  kind: ComplianceGateKind;
  phaseRef: string;
  label: string;
  verifyScript: string;
  required: boolean;
  description: string;
};

export type ComplianceGateManifest = {
  version: typeof V69_ARCHITECTURE_COMPLIANCE_VERSION;
  gateCount: number;
  kindCount: number;
  catalogComplete: boolean;
  gates: ComplianceGateEntry[];
  summary: string;
};

export type AlignmentCheckEntry = {
  id: string;
  sourceLayer: AlignmentLayer;
  targetLayer: AlignmentLayer;
  alignmentCriterion: string;
  required: boolean;
  description: string;
};

export type AlignmentCheckManifest = {
  version: typeof V69_ARCHITECTURE_COMPLIANCE_VERSION;
  entryCount: number;
  layerCount: number;
  catalogComplete: boolean;
  checks: AlignmentCheckEntry[];
  summary: string;
};

export type DeviationEntry = {
  id: string;
  complianceObjectRef: string;
  severity: DeviationSeverity;
  deviationType: string;
  gateBlock: boolean;
  required: boolean;
  description: string;
};

export type DeviationManifest = {
  version: typeof V69_ARCHITECTURE_COMPLIANCE_VERSION;
  entryCount: number;
  severityCount: number;
  catalogComplete: boolean;
  deviations: DeviationEntry[];
  summary: string;
};

export type ExceptionEntry = {
  id: string;
  deviationRef: string;
  exceptionKind: string;
  status: ExceptionStatus;
  expiryPolicy: string;
  required: boolean;
  description: string;
};

export type ExceptionManifest = {
  version: typeof V69_ARCHITECTURE_COMPLIANCE_VERSION;
  entryCount: number;
  statusCount: number;
  catalogComplete: boolean;
  exceptions: ExceptionEntry[];
  summary: string;
};

export type ArchitectureComplianceRegistry = {
  version: typeof V69_ARCHITECTURE_COMPLIANCE_VERSION;
  objectIds: string[];
  ruleIds: string[];
  checkIds: string[];
  gateIds: string[];
  alignmentIds: string[];
  deviationIds: string[];
  exceptionIds: string[];
  totalEntries: number;
  registryComplete: boolean;
  summary: string;
};

export type ArchitectureComplianceReport = {
  version: typeof V69_ARCHITECTURE_COMPLIANCE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  qualityGovernanceVersion: string;
  qualityGovernanceReady: boolean;
  objects: ComplianceObjectManifest;
  rules: ComplianceRuleManifest;
  checks: ComplianceCheckManifest;
  gates: ComplianceGateManifest;
  alignmentChecks: AlignmentCheckManifest;
  deviations: DeviationManifest;
  exceptions: ExceptionManifest;
  registry: ArchitectureComplianceRegistry;
  complianceReady: boolean;
  readinessScore: number;
  summary: string;
};
