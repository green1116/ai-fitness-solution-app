import type { GatedBridgeOrchestratorResult } from "../gated-orchestrator/types";
import type { HITLBridgeCoordinationRuntimeResult } from "../hitl-bridge/types";

export const V4A5_COMMAND_PLATFORM_VERSION = "v4-a5-autonomous-command-platform" as const;
export type V4A5CommandPlatformVersion = typeof V4A5_COMMAND_PLATFORM_VERSION;

export const COMMAND_PLATFORM_BASELINE_VERSION = "v4-a5-final-command-platform-baseline-1" as const;
export type CommandPlatformBaselineVersion = typeof COMMAND_PLATFORM_BASELINE_VERSION;

export type CommandBaselineFreezeStatus = "frozen" | "draft";

export type CommandCapabilityTier =
  | "foundation"
  | "bridge"
  | "hitl"
  | "coordination"
  | "api"
  | "orchestration";

export type CommandCapabilityClass =
  | "command-core"
  | "execution-bridge"
  | "human-control"
  | "admission"
  | "surface"
  | "orchestration";

export type CommandCapabilityCatalogEntry = {
  capabilityId: string;
  releaseTag: string;
  label: string;
  tier: CommandCapabilityTier;
  capabilityClass: CommandCapabilityClass;
  dependsOn: string[];
};

export type CommandCapabilityInventoryEntry = {
  entryId: string;
  capabilityId: string;
  releaseTag: string;
  label: string;
  tier: CommandCapabilityTier;
  capabilityClass: CommandCapabilityClass;
  version: string;
  present: boolean;
  frozen: boolean;
};

export type CommandCapabilityClassification = {
  classificationId: string;
  tier: CommandCapabilityTier;
  capabilityClass: CommandCapabilityClass;
  capabilityIds: string[];
  count: number;
};

export type CommandCapabilityDependencyEdge = {
  edgeId: string;
  fromCapabilityId: string;
  toCapabilityId: string;
  relation: "requires" | "extends" | "gates";
};

export type CommandCapabilityDependencyGraph = {
  graphId: string;
  nodes: string[];
  edges: CommandCapabilityDependencyEdge[];
};

export type CommandComplexityReport = {
  reportId: string;
  capabilityCount: number;
  tierCount: number;
  dependencyDepth: number;
  gateAdmitted: number;
  gateBlocked: number;
  orchestrationModes: number;
  complexityScore: number;
  verdict: "baseline-acceptable" | "baseline-elevated" | "baseline-excessive";
  findings: string[];
};

export type CommandBaselineReport = {
  reportId: string;
  platformVersion: V4A5CommandPlatformVersion;
  baselineVersion: CommandPlatformBaselineVersion;
  capabilityCount: number;
  frozenCapabilityCount: number;
  classificationCount: number;
  dependencyEdgeCount: number;
  complexityVerdict: CommandComplexityReport["verdict"];
  summary: string;
};

export type CommandReleaseBaseline = {
  baselineId: string;
  releaseTag: "V4-A5-FINAL";
  platformVersion: V4A5CommandPlatformVersion;
  baselineVersion: CommandPlatformBaselineVersion;
  frozen: true;
  frozenAt: string;
  capabilityCount: number;
  manifestDigest: string;
  verifyGroups: string[];
  frozenLayers: string[];
};

export type CommandPlatformBaselineLineageEntry = {
  entryId: string;
  event: "inventory" | "classification" | "dependency" | "complexity" | "baseline" | "release";
  detail: string;
  timestamp: string;
};

export type CommandPlatformBaselineLineageGraph = {
  graphId: string;
  entries: CommandPlatformBaselineLineageEntry[];
};

export type CommandPlatformBaselineAuditRecord = {
  baselineId: string;
  deploymentId: string;
  capabilityCount: number;
  frozen: boolean;
  manifestDigest: string;
  timestamp: string;
};

export type CommandPlatformBaselineHookPhase =
  | "beforeCapabilityInventory"
  | "afterCapabilityInventory"
  | "beforeBaselineFreeze"
  | "afterBaselineFreeze";

export type CommandPlatformBaselineHookEvent = {
  phase: CommandPlatformBaselineHookPhase;
  payload: string;
};

export type CommandCapabilityVersionSnapshot = {
  capabilityId: string;
  version: string;
  status?: string;
};

export type CommandPlatformBaselineRuntimeInput = {
  deploymentId: string;
  platformVersion: V4A5CommandPlatformVersion;
  capabilities: CommandCapabilityVersionSnapshot[];
  coordination: HITLBridgeCoordinationRuntimeResult;
  orchestrator: GatedBridgeOrchestratorResult;
};

export type CommandPlatformBaselineRuntimeResult = {
  version: CommandPlatformBaselineVersion;
  registry: { baselineId: string; freezeCycle: number };
  inventory: CommandCapabilityInventoryEntry[];
  classifications: CommandCapabilityClassification[];
  dependencyGraph: CommandCapabilityDependencyGraph;
  complexityReport: CommandComplexityReport;
  baselineReport: CommandBaselineReport;
  releaseBaseline: CommandReleaseBaseline;
  lineage: CommandPlatformBaselineLineageGraph;
  audit: CommandPlatformBaselineAuditRecord[];
  hooks: CommandPlatformBaselineHookEvent[];
  summary: { summaryId: string; text: string; traceId: string };
  status: CommandBaselineFreezeStatus;
};
