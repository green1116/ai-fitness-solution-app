import type { GovernanceMetaGovernanceRuntimeResult } from "../meta-governance/meta-governance-types";
import type { GovernanceSelfOptimizationRuntimeResult } from "../self-optimization/optimization-types";

export const V4A3_GOVERNANCE_PLATFORM_VERSION = "4-a3-operational-governance-1" as const;
export type V4A3GovernancePlatformVersion = typeof V4A3_GOVERNANCE_PLATFORM_VERSION;

export const GOVERNANCE_PLATFORM_BASELINE_VERSION =
  "v4-a3-final-governance-platform-baseline-1" as const;
export type GovernancePlatformBaselineVersion = typeof GOVERNANCE_PLATFORM_BASELINE_VERSION;

export type GovernanceBaselineFreezeStatus = "frozen" | "draft";

export type GovernanceCapabilityTier =
  | "core"
  | "incident-profile"
  | "federation"
  | "observability"
  | "intelligence"
  | "autonomous"
  | "optimization"
  | "meta";

export type GovernanceCapabilityClass =
  | "foundation"
  | "execution"
  | "persistence"
  | "recovery"
  | "integration"
  | "coordination"
  | "observation"
  | "cognition"
  | "automation"
  | "evolution"
  | "governance-meta";

export type GovernanceCapabilityCatalogEntry = {
  capabilityId: string;
  releaseTag: string;
  label: string;
  tier: GovernanceCapabilityTier;
  capabilityClass: GovernanceCapabilityClass;
  dependsOn: string[];
};

export type GovernanceCapabilityInventoryEntry = {
  entryId: string;
  capabilityId: string;
  releaseTag: string;
  label: string;
  tier: GovernanceCapabilityTier;
  capabilityClass: GovernanceCapabilityClass;
  version: string;
  present: boolean;
  frozen: boolean;
};

export type GovernanceCapabilityClassification = {
  classificationId: string;
  tier: GovernanceCapabilityTier;
  capabilityClass: GovernanceCapabilityClass;
  capabilityIds: string[];
  count: number;
};

export type GovernanceCapabilityDependencyEdge = {
  edgeId: string;
  fromCapabilityId: string;
  toCapabilityId: string;
  relation: "requires" | "extends" | "observes";
};

export type GovernanceCapabilityDependencyGraph = {
  graphId: string;
  nodes: string[];
  edges: GovernanceCapabilityDependencyEdge[];
};

export type GovernanceComplexityReport = {
  reportId: string;
  capabilityCount: number;
  tierCount: number;
  dependencyDepth: number;
  overComplex: boolean;
  complexityScore: number;
  tuningPressure: number;
  verdict: "baseline-acceptable" | "baseline-elevated" | "baseline-excessive";
  findings: string[];
};

export type GovernanceBaselineReport = {
  reportId: string;
  platformVersion: V4A3GovernancePlatformVersion;
  baselineVersion: GovernancePlatformBaselineVersion;
  capabilityCount: number;
  frozenCapabilityCount: number;
  classificationCount: number;
  dependencyEdgeCount: number;
  complexityVerdict: GovernanceComplexityReport["verdict"];
  summary: string;
};

export type GovernanceReleaseBaseline = {
  baselineId: string;
  releaseTag: "V4-A3-FINAL";
  platformVersion: V4A3GovernancePlatformVersion;
  baselineVersion: GovernancePlatformBaselineVersion;
  frozen: true;
  frozenAt: string;
  capabilityCount: number;
  manifestDigest: string;
  verifyGroups: string[];
};

export type GovernancePlatformBaselineLineageEntry = {
  entryId: string;
  event: "inventory" | "classification" | "dependency" | "complexity" | "baseline" | "release";
  detail: string;
  timestamp: string;
};

export type GovernancePlatformBaselineLineageGraph = {
  graphId: string;
  entries: GovernancePlatformBaselineLineageEntry[];
};

export type GovernancePlatformBaselineAuditRecord = {
  baselineId: string;
  deploymentId: string;
  capabilityCount: number;
  frozen: boolean;
  manifestDigest: string;
  timestamp: string;
};

export type GovernancePlatformBaselineHookPhase =
  | "beforeCapabilityInventory"
  | "afterCapabilityInventory"
  | "beforeBaselineFreeze"
  | "afterBaselineFreeze";

export type GovernancePlatformBaselineHookEvent = {
  phase: GovernancePlatformBaselineHookPhase;
  payload: string;
};

export type GovernanceCapabilityVersionSnapshot = {
  capabilityId: string;
  version: string;
  status?: string;
};

export type GovernancePlatformBaselineRuntimeInput = {
  deploymentId: string;
  platformVersion: V4A3GovernancePlatformVersion;
  capabilities: GovernanceCapabilityVersionSnapshot[];
  metaGovernance: GovernanceMetaGovernanceRuntimeResult;
  selfOptimization: GovernanceSelfOptimizationRuntimeResult;
};

export type GovernancePlatformBaselineRuntimeResult = {
  version: GovernancePlatformBaselineVersion;
  registry: { baselineId: string; freezeCycle: number };
  inventory: GovernanceCapabilityInventoryEntry[];
  classifications: GovernanceCapabilityClassification[];
  dependencyGraph: GovernanceCapabilityDependencyGraph;
  complexityReport: GovernanceComplexityReport;
  baselineReport: GovernanceBaselineReport;
  releaseBaseline: GovernanceReleaseBaseline;
  lineage: GovernancePlatformBaselineLineageGraph;
  audit: GovernancePlatformBaselineAuditRecord[];
  hooks: GovernancePlatformBaselineHookEvent[];
  summary: { summaryId: string; text: string; traceId: string };
  status: GovernanceBaselineFreezeStatus;
};
