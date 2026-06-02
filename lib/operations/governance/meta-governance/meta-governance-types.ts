import type { GovernanceAutonomousRuntimeResult } from "../autonomous/autonomous-types";
import type { GovernanceIntelligenceRuntimeResult } from "../intelligence/intelligence-types";
import type { FederationObservabilityRuntimeResult } from "../federation-observability/observability-types";
import type { GovernanceSelfOptimizationRuntimeResult } from "../self-optimization/optimization-types";

export const GOVERNANCE_META_GOVERNANCE_RUNTIME_VERSION =
  "v4-a3-r14-governance-meta-governance-runtime-1" as const;
export type GovernanceMetaGovernanceRuntimeVersion =
  typeof GOVERNANCE_META_GOVERNANCE_RUNTIME_VERSION;

export type MetaGovernanceStatus = "evolving" | "stabilizing" | "consolidating" | "frozen";
export type GovernanceEvolutionAction =
  | "retain"
  | "deprecate"
  | "upgrade"
  | "merge"
  | "standardize"
  | "freeze"
  | "retire";

export type GovernanceMechanismLifecyclePhase =
  | "active"
  | "standardization-candidate"
  | "freeze-candidate"
  | "retirement-candidate";

export type GovernanceMechanismInventoryEntry = {
  entryId: string;
  mechanismId: string;
  module: string;
  layer: "federation" | "intelligence" | "autonomous" | "optimization" | "meta";
  effectivenessScore: number;
  complexityIndex: number;
  observedAt: string;
};

export type GovernanceEvolutionAssessment = {
  assessmentId: string;
  deploymentId: string;
  overComplex: boolean;
  complexityScore: number;
  redundantPairs: string[];
  standardizationReady: string[];
  rationale: string;
};

export type GovernanceEvolutionDecision = {
  decisionId: string;
  mechanismId: string;
  module: string;
  action: GovernanceEvolutionAction;
  lifecyclePhase: GovernanceMechanismLifecyclePhase;
  priority: "low" | "medium" | "high" | "critical";
  reason: string;
  mergeTarget?: string;
};

export type GovernanceComplexityProfile = {
  profileId: string;
  moduleCount: number;
  ineffectiveCount: number;
  tuningPressure: number;
  overlapScore: number;
  verdict: "healthy" | "elevated" | "excessive";
};

export type GovernanceStandardizationPlan = {
  planId: string;
  candidates: string[];
  expectedReduction: number;
  actions: string[];
};

export type GovernanceMetaGovernanceScore = {
  scoreId: string;
  evolutionClarity: number;
  complexityControl: number;
  lifecycleHealth: number;
  standardizationReadiness: number;
  compositeScore: number;
};

export type GovernanceMetaGovernanceLineageEntry = {
  entryId: string;
  event: "inventory" | "assessment" | "decision" | "complexity" | "standardization" | "score";
  detail: string;
  timestamp: string;
};

export type GovernanceMetaGovernanceLineageGraph = {
  graphId: string;
  entries: GovernanceMetaGovernanceLineageEntry[];
};

export type GovernanceMetaGovernanceAuditRecord = {
  metaGovernanceId: string;
  federationId: string;
  decisionCount: number;
  overComplex: boolean;
  compositeScore: number;
  timestamp: string;
};

export type GovernanceMetaGovernanceHookPhase =
  | "beforeMechanismInventory"
  | "afterMechanismInventory"
  | "beforeEvolutionAssessment"
  | "afterEvolutionAssessment"
  | "beforeEvolutionDecisions"
  | "afterEvolutionDecisions";

export type GovernanceMetaGovernanceHookEvent = {
  phase: GovernanceMetaGovernanceHookPhase;
  payload: string;
};

export type GovernanceMetaGovernanceRuntimeInput = {
  deploymentId: string;
  selfOptimization: GovernanceSelfOptimizationRuntimeResult;
  observability: FederationObservabilityRuntimeResult;
  intelligence: GovernanceIntelligenceRuntimeResult;
  autonomous: GovernanceAutonomousRuntimeResult;
};

export type GovernanceMetaGovernanceRuntimeResult = {
  version: GovernanceMetaGovernanceRuntimeVersion;
  registry: { metaGovernanceId: string; evolutionCycle: number };
  inventory: GovernanceMechanismInventoryEntry[];
  assessment: GovernanceEvolutionAssessment;
  decisions: GovernanceEvolutionDecision[];
  complexity: GovernanceComplexityProfile;
  standardization: GovernanceStandardizationPlan;
  metaScore: GovernanceMetaGovernanceScore;
  lineage: GovernanceMetaGovernanceLineageGraph;
  audit: GovernanceMetaGovernanceAuditRecord[];
  hooks: GovernanceMetaGovernanceHookEvent[];
  summary: { summaryId: string; text: string; traceId: string };
  status: MetaGovernanceStatus;
};
