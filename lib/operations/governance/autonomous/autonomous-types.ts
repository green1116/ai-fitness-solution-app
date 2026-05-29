import type { GovernanceIntelligenceRuntimeResult } from "../intelligence/intelligence-types";
import type { FederationObservabilityRuntimeResult } from "../federation-observability/observability-types";
import type { FederationRuntimeResult } from "../federation/federation-types";
import type { LifecycleContinuityRuntimeResult } from "../federation-lifecycle/continuity-types";

export const GOVERNANCE_AUTONOMOUS_RUNTIME_VERSION =
  "v4-a3-r12-governance-autonomous-runtime-1" as const;
export type GovernanceAutonomousRuntimeVersion = typeof GOVERNANCE_AUTONOMOUS_RUNTIME_VERSION;

export type GovernanceAutonomousStatus = "advisory" | "proposed" | "planned" | "awaiting_approval" | "autopilot_ready";
export type GovernanceApprovalStatus = "auto_approved" | "manual_review" | "executive_review" | "blocked";
export type GovernanceDecisionDomain = "risk" | "policy" | "topology" | "lifecycle" | "recovery" | "optimization";

export type GovernanceAutonomousSignal = {
  signalId: string;
  source: string;
  value: number;
  weight: number;
};

export type GovernanceAutonomousSignalBundle = {
  bundleId: string;
  signals: GovernanceAutonomousSignal[];
};

export type GovernanceAutonomousAnalysis = {
  analysisId: string;
  mode: "advice" | "autonomous";
  readinessScore: number;
  blockers: string[];
};

export type GovernanceDecisionCandidate = {
  candidateId: string;
  domain: GovernanceDecisionDomain;
  decision: string;
  confidence: number;
  riskAware: boolean;
  policyAware: boolean;
  topologyAware: boolean;
  lifecycleAware: boolean;
};

export type GovernanceActionProposal = {
  proposalId: string;
  action: string;
  rationale: string;
  expectedImpact: string;
  confidence: number;
  rollbackStrategy: string;
  sourceRecommendationId?: string;
};

export type GovernanceExecutionPlanStep = {
  stepId: string;
  order: number;
  action: string;
  dependencyValidated: boolean;
  safetyCheckPassed: boolean;
};

export type GovernanceExecutionPlan = {
  planId: string;
  steps: GovernanceExecutionPlanStep[];
  rollbackPlan: string;
  safestPath: boolean;
};

export type GovernanceRemediationPlan = {
  remediationId: string;
  category: "consensus" | "propagation" | "lifecycle" | "recovery" | "topology";
  action: string;
  priority: "low" | "medium" | "high" | "urgent";
};

export type GovernanceOptimizationProposal = {
  optimizationId: string;
  category: "governance" | "routing" | "policy" | "federation" | "resilience";
  action: string;
  expectedGain: number;
};

export type GovernanceApprovalCandidate = {
  approvalId: string;
  proposalId: string;
  status: GovernanceApprovalStatus;
  reason: string;
};

export type GovernanceAutonomousScore = {
  scoreId: string;
  decisionQuality: number;
  planningQuality: number;
  remediationQuality: number;
  optimizationQuality: number;
  confidence: number;
  compositeScore: number;
};

export type GovernanceAutonomousLineageEntry = {
  entryId: string;
  event: "signals" | "analysis" | "decision" | "proposal" | "plan" | "remediation" | "optimization" | "approval" | "score";
  detail: string;
  timestamp: string;
};

export type GovernanceAutonomousLineageGraph = {
  graphId: string;
  entries: GovernanceAutonomousLineageEntry[];
};

export type GovernanceAutonomousAuditRecord = {
  autonomousId: string;
  federationId: string;
  proposalCount: number;
  approvalStatus: GovernanceApprovalStatus;
  compositeScore: number;
  timestamp: string;
};

export type GovernanceAutonomousHookPhase =
  | "beforeAutonomousAnalysis"
  | "afterAutonomousAnalysis"
  | "beforeActionProposal"
  | "afterActionProposal"
  | "beforeExecutionPlanning"
  | "afterExecutionPlanning"
  | "beforeApprovalGate"
  | "afterApprovalGate";

export type GovernanceAutonomousHookEvent = {
  phase: GovernanceAutonomousHookPhase;
  payload: string;
};

export type GovernanceAutonomousRuntimeInput = {
  deploymentId: string;
  intelligence: GovernanceIntelligenceRuntimeResult;
  observability: FederationObservabilityRuntimeResult;
  federation: FederationRuntimeResult;
  lifecycleContinuity: LifecycleContinuityRuntimeResult;
};

export type GovernanceAutonomousRuntimeResult = {
  version: GovernanceAutonomousRuntimeVersion;
  registry: { autonomousId: string; proposalCount: number };
  signals: GovernanceAutonomousSignalBundle;
  analysis: GovernanceAutonomousAnalysis;
  decisions: GovernanceDecisionCandidate[];
  proposals: GovernanceActionProposal[];
  executionPlan: GovernanceExecutionPlan;
  remediations: GovernanceRemediationPlan[];
  optimizations: GovernanceOptimizationProposal[];
  approval: GovernanceApprovalCandidate;
  autonomousScore: GovernanceAutonomousScore;
  lineage: GovernanceAutonomousLineageGraph;
  audit: GovernanceAutonomousAuditRecord[];
  hooks: GovernanceAutonomousHookEvent[];
  summary: { summaryId: string; text: string; traceId: string };
  status: GovernanceAutonomousStatus;
};
