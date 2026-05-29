import type { GovernanceAutonomousRuntimeResult } from "../autonomous/autonomous-types";
import type { GovernanceIntelligenceRuntimeResult } from "../intelligence/intelligence-types";
import type { FederationObservabilityRuntimeResult } from "../federation-observability/observability-types";

export const GOVERNANCE_SELF_OPTIMIZATION_RUNTIME_VERSION =
  "v4-a3-r13-governance-self-optimization-runtime-1" as const;
export type GovernanceSelfOptimizationRuntimeVersion =
  typeof GOVERNANCE_SELF_OPTIMIZATION_RUNTIME_VERSION;

export type SelfOptimizationStatus = "stable" | "tuning" | "improving" | "degraded";
export type GovernanceMechanismEffectiveness = "high" | "medium" | "low" | "ineffective";
export type GovernanceStrategyDomain = "policy" | "orchestration" | "recovery" | "federation" | "consensus" | "lifecycle";

export type GovernanceFeedbackEntry = {
  entryId: string;
  source: string;
  metric: string;
  value: number;
  observedAt: string;
};

export type GovernanceFeedbackLoop = {
  loopId: string;
  federationId: string;
  entries: GovernanceFeedbackEntry[];
  cycleComplete: boolean;
};

export type GovernanceMechanismScore = {
  mechanismId: string;
  module: string;
  effectiveness: GovernanceMechanismEffectiveness;
  score: number;
  trend: "improving" | "stable" | "declining";
};

export type GovernanceStrategyOptimization = {
  optimizationId: string;
  domain: GovernanceStrategyDomain;
  currentStrategy: string;
  recommendedStrategy: string;
  expectedGain: number;
  priority: "low" | "medium" | "high";
};

export type GovernanceModuleOptimization = {
  moduleId: string;
  moduleName: string;
  shouldOptimize: boolean;
  tuningAction: string;
  impactScore: number;
};

export type GovernanceImpactAssessment = {
  assessmentId: string;
  stabilityDelta: number;
  resilienceDelta: number;
  continuityDelta: number;
  confidenceDelta: number;
  overallImpact: number;
};

export type GovernanceResilienceOptimization = {
  resilienceId: string;
  currentResilience: number;
  targetResilience: number;
  actions: string[];
};

export type GovernanceSelfOptimizationScore = {
  scoreId: string;
  feedbackQuality: number;
  effectivenessScore: number;
  strategyScore: number;
  impactScore: number;
  loopHealth: number;
  compositeScore: number;
};

export type GovernanceSelfOptimizationLineageEntry = {
  entryId: string;
  event: "feedback" | "effectiveness" | "strategy" | "module" | "impact" | "resilience" | "loop" | "score";
  detail: string;
  timestamp: string;
};

export type GovernanceSelfOptimizationLineageGraph = {
  graphId: string;
  entries: GovernanceSelfOptimizationLineageEntry[];
};

export type GovernanceSelfOptimizationAuditRecord = {
  optimizationId: string;
  federationId: string;
  mechanismCount: number;
  strategyCount: number;
  compositeScore: number;
  timestamp: string;
};

export type GovernanceSelfOptimizationHookPhase =
  | "beforeFeedbackCollection"
  | "afterFeedbackCollection"
  | "beforeEffectivenessEvaluation"
  | "afterEffectivenessEvaluation"
  | "beforeOptimizationLoop"
  | "afterOptimizationLoop";

export type GovernanceSelfOptimizationHookEvent = {
  phase: GovernanceSelfOptimizationHookPhase;
  payload: string;
};

export type GovernanceSelfOptimizationRuntimeInput = {
  deploymentId: string;
  observability: FederationObservabilityRuntimeResult;
  intelligence: GovernanceIntelligenceRuntimeResult;
  autonomous: GovernanceAutonomousRuntimeResult;
};

export type GovernanceSelfOptimizationRuntimeResult = {
  version: GovernanceSelfOptimizationRuntimeVersion;
  registry: { optimizationId: string; loopCycles: number };
  feedback: GovernanceFeedbackLoop;
  mechanisms: GovernanceMechanismScore[];
  strategies: GovernanceStrategyOptimization[];
  modules: GovernanceModuleOptimization[];
  impact: GovernanceImpactAssessment;
  resilience: GovernanceResilienceOptimization;
  loopClosed: boolean;
  optimizationScore: GovernanceSelfOptimizationScore;
  lineage: GovernanceSelfOptimizationLineageGraph;
  audit: GovernanceSelfOptimizationAuditRecord[];
  hooks: GovernanceSelfOptimizationHookEvent[];
  summary: { summaryId: string; text: string; traceId: string };
  status: SelfOptimizationStatus;
};
