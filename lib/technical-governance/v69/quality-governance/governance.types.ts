/**
 * V69 P6 — Quality governance types (read-only)
 */

export const V69_QUALITY_GOVERNANCE_VERSION = "v69-quality-governance-1" as const;
export const V69_QUALITY_GOVERNANCE_FREEZE_VERSION = "v69-quality-governance-freeze-1" as const;

export type QualityStandardKind =
  | "test"
  | "acceptance"
  | "gate"
  | "defect"
  | "release"
  | "verification";

export type QualityGateKind = "verify" | "compile" | "manifest" | "alignment" | "readiness";

export type DefectSeverity = "blocker" | "critical" | "major" | "minor";

export type QualityGovernanceSignals = {
  securityGovernanceReady?: boolean;
  objectCatalogComplete?: boolean;
  standardCatalogComplete?: boolean;
  gateCatalogComplete?: boolean;
  testStandardsComplete?: boolean;
  acceptanceRulesComplete?: boolean;
  defectControlsComplete?: boolean;
  releaseQualityComplete?: boolean;
  refsAligned?: boolean;
  freezeLockIntact?: boolean;
};

export type QualityGovernanceObject = {
  id: string;
  arcDefRef: string;
  securityObjectRef: string;
  codeObjectRef: string;
  name: string;
  required: boolean;
  description: string;
};

export type QualityGovernanceObjectManifest = {
  version: typeof V69_QUALITY_GOVERNANCE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  objects: QualityGovernanceObject[];
  summary: string;
};

export type QualityStandardEntry = {
  id: string;
  kind: QualityStandardKind;
  label: string;
  metric: string;
  threshold: string;
  enforceLevel: "required" | "recommended";
  required: boolean;
  description: string;
};

export type QualityStandardManifest = {
  version: typeof V69_QUALITY_GOVERNANCE_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  standards: QualityStandardEntry[];
  summary: string;
};

export type QualityGateEntry = {
  id: string;
  kind: QualityGateKind;
  phaseRef: string;
  label: string;
  verifyScript: string;
  required: boolean;
  description: string;
};

export type QualityGateManifest = {
  version: typeof V69_QUALITY_GOVERNANCE_VERSION;
  gateCount: number;
  kindCount: number;
  catalogComplete: boolean;
  gates: QualityGateEntry[];
  summary: string;
};

export type TestStandardEntry = {
  id: string;
  qualityObjectRef: string;
  testKind: "unit" | "integration" | "contract" | "verify";
  coverageTarget: number;
  required: boolean;
  description: string;
};

export type TestStandardManifest = {
  version: typeof V69_QUALITY_GOVERNANCE_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  standards: TestStandardEntry[];
  summary: string;
};

export type AcceptanceRuleEntry = {
  id: string;
  qualityGateRef: string;
  criterion: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type AcceptanceRuleManifest = {
  version: typeof V69_QUALITY_GOVERNANCE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  rules: AcceptanceRuleEntry[];
  summary: string;
};

export type DefectControlEntry = {
  id: string;
  qualityObjectRef: string;
  severity: DefectSeverity;
  controlAction: string;
  gateBlock: boolean;
  required: boolean;
  description: string;
};

export type DefectControlManifest = {
  version: typeof V69_QUALITY_GOVERNANCE_VERSION;
  entryCount: number;
  severityCount: number;
  catalogComplete: boolean;
  controls: DefectControlEntry[];
  summary: string;
};

export type ReleaseQualityEntry = {
  id: string;
  qualityGateRef: string;
  releaseStage: string;
  readinessScore: number;
  required: boolean;
  description: string;
};

export type ReleaseQualityManifest = {
  version: typeof V69_QUALITY_GOVERNANCE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  requirements: ReleaseQualityEntry[];
  summary: string;
};

export type QualityGovernanceRegistry = {
  version: typeof V69_QUALITY_GOVERNANCE_VERSION;
  objectIds: string[];
  standardIds: string[];
  gateIds: string[];
  testIds: string[];
  acceptanceIds: string[];
  defectIds: string[];
  releaseIds: string[];
  totalEntries: number;
  registryComplete: boolean;
  summary: string;
};

export type QualityGovernanceReport = {
  version: typeof V69_QUALITY_GOVERNANCE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  securityGovernanceVersion: string;
  securityGovernanceReady: boolean;
  objects: QualityGovernanceObjectManifest;
  standards: QualityStandardManifest;
  gates: QualityGateManifest;
  testStandards: TestStandardManifest;
  acceptanceRules: AcceptanceRuleManifest;
  defectControls: DefectControlManifest;
  releaseQuality: ReleaseQualityManifest;
  registry: QualityGovernanceRegistry;
  governanceReady: boolean;
  readinessScore: number;
  summary: string;
};
