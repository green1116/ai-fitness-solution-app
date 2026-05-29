import type { ConsensusRuntimeResult } from "../federation-consensus/consensus-types";
import type { LifecycleContinuityRuntimeResult } from "../federation-lifecycle/continuity-types";
import type { FederationRuntimeResult } from "../federation/federation-types";
import type { PolicyPropagationRuntimeResult } from "../federation-policy/propagation-types";

export const GOVERNANCE_FEDERATION_OBSERVABILITY_RUNTIME_VERSION =
  "v4-a3-r10-federation-observability-runtime-1" as const;
export type GovernanceFederationObservabilityRuntimeVersion =
  typeof GOVERNANCE_FEDERATION_OBSERVABILITY_RUNTIME_VERSION;

export type FederationObservabilityStatus = "healthy" | "degraded" | "critical" | "unknown";
export type FederationRiskLevel = "low" | "medium" | "high" | "critical";

export type FederationHealthSnapshot = {
  snapshotId: string;
  federationId: string;
  healthScore: number;
  activeDomains: string[];
  degradedDomains: string[];
  isolatedDomains: string[];
  activeNodes: string[];
  failedNodes: string[];
  consensusSuccessRate: number;
  propagationSuccessRate: number;
  lifecycleStability: number;
  observedAt: string;
};

export type FederationTopologyObservability = {
  observabilityId: string;
  domainCount: number;
  nodeCount: number;
  edgeCount: number;
  topologyHealthScore: number;
  degradedRoutes: number;
};

export type FederationConsensusObservability = {
  observabilityId: string;
  votingSuccessRate: number;
  quorumReachRate: number;
  reconciliationRate: number;
  convergenceLatencyMs: number;
  recoveryConsensusCount: number;
};

export type FederationPropagationObservability = {
  observabilityId: string;
  fanoutSuccessRate: number;
  syncLatencyMs: number;
  rollbackCount: number;
  freezeCount: number;
  conflictCount: number;
};

export type FederationLifecycleObservability = {
  observabilityId: string;
  activeDomains: number;
  frozenDomains: number;
  recoveringDomains: number;
  retiringDomains: number;
  archivedDomains: number;
};

export type FederationRecoveryObservability = {
  observabilityId: string;
  recoveryActions: number;
  stabilizationPending: boolean;
  failoverActive: boolean;
  recoveryHealthScore: number;
};

export type FederationRiskProfile = {
  profileId: string;
  overallRisk: FederationRiskLevel;
  topologyRisk: FederationRiskLevel;
  consensusRisk: FederationRiskLevel;
  propagationRisk: FederationRiskLevel;
  lifecycleRisk: FederationRiskLevel;
  recoveryRisk: FederationRiskLevel;
  riskFactors: string[];
};

export type FederationGovernanceScore = {
  scoreId: string;
  healthScore: number;
  stabilityScore: number;
  resilienceScore: number;
  continuityScore: number;
  confidenceScore: number;
  compositeScore: number;
};

export type FederationObservabilityLineageEntry = {
  entryId: string;
  event: "health" | "topology" | "consensus" | "propagation" | "lifecycle" | "recovery" | "risk" | "score";
  detail: string;
  timestamp: string;
};

export type FederationObservabilityLineageGraph = {
  graphId: string;
  entries: FederationObservabilityLineageEntry[];
};

export type FederationObservabilityAuditRecord = {
  observabilityId: string;
  federationId: string;
  healthScore: number;
  compositeScore: number;
  overallRisk: FederationRiskLevel;
  timestamp: string;
};

export type FederationObservabilityHookPhase =
  | "beforeHealthObservation"
  | "afterHealthObservation"
  | "beforeRiskEvaluation"
  | "afterRiskEvaluation"
  | "beforeGovernanceScoring"
  | "afterGovernanceScoring";

export type FederationObservabilityHookEvent = {
  phase: FederationObservabilityHookPhase;
  domainId: string;
  payload: string;
};

export type FederationObservabilityRuntimeInput = {
  deploymentId: string;
  federation: FederationRuntimeResult;
  consensus: ConsensusRuntimeResult;
  policyPropagation: PolicyPropagationRuntimeResult;
  lifecycleContinuity: LifecycleContinuityRuntimeResult;
};

export type FederationObservabilityRuntimeResult = {
  version: GovernanceFederationObservabilityRuntimeVersion;
  registry: { observabilityId: string; snapshotCount: number };
  health: FederationHealthSnapshot;
  topology: FederationTopologyObservability;
  consensus: FederationConsensusObservability;
  propagation: FederationPropagationObservability;
  lifecycle: FederationLifecycleObservability;
  recovery: FederationRecoveryObservability;
  risk: FederationRiskProfile;
  governanceScore: FederationGovernanceScore;
  lineage: FederationObservabilityLineageGraph;
  audit: FederationObservabilityAuditRecord[];
  hooks: FederationObservabilityHookEvent[];
  summary: { summaryId: string; text: string; traceId: string };
  status: FederationObservabilityStatus;
};
