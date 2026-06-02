import type { EvidenceRuntimeResult } from "@/lib/tender/evidence/runtime/types";
import type { EvidenceQueryResult } from "@/lib/tender/evidence/query/types";
import type { BidDecisionGateResult } from "@/lib/tender/score/buildBidDecisionGate";
import type { BidDecisionSummary } from "@/lib/tender/score/buildBidDecisionSummary";
import type { TechnicalCompliancePackage } from "@/lib/tender/compliance/types";
import type { TenderSemanticGraph } from "@/lib/tender/semantic/types";
import type { SKUIntelligenceResult } from "@/lib/tender/sku/skuTypes";
import type { computeTenderScore } from "@/lib/tender/scoreEngine";
import type { computeTenderRiskFromRows } from "@/lib/tender/computeTenderRisk";

/** V2.9 工作流步骤 */
export type TenderWorkflowStepId =
  | "parse"
  | "semantic"
  | "sku"
  | "compliance"
  | "evidence"
  | "score"
  | "gate"
  | "decision";

export type WorkflowStepStatus =
  | "pending"
  | "running"
  | "completed"
  | "skipped"
  | "failed";

/** 整体运行时状态 */
export type RuntimeStatus =
  | "ready"
  | "caution"
  | "blocked"
  | "incomplete";

export type RuntimeGateAction = "allow" | "warn" | "block";

export type WorkflowStepResult = {
  stepId: TenderWorkflowStepId;
  status: WorkflowStepStatus;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  message: string;
  error?: string;
  metrics?: Record<string, number | string | boolean>;
};

export type RuntimeScoringImpact = {
  currentScoreRatio: number | null;
  evidenceCoverageRatio: number;
  gapCount: number;
  riskyCount: number;
  affectedScoringItemIds: string[];
  estimatedRecoverablePoints: number;
  narrative: string;
};

export type RuntimeRecommendationPriority = "critical" | "high" | "medium" | "low";

export type RuntimeRecommendationCategory =
  | "evidence"
  | "score"
  | "attachment"
  | "compliance"
  | "general";

export type RuntimeRecommendation = {
  id: string;
  priority: RuntimeRecommendationPriority;
  category: RuntimeRecommendationCategory;
  title: string;
  description: string;
  suggestedAction: string;
  relatedRequirementIds?: string[];
  relatedScoringItemIds?: string[];
};

export type RuntimeDecision = {
  action: RuntimeGateAction;
  passed: boolean;
  status: RuntimeStatus;
  title: string;
  message: string;
  reasons: string[];
  suggestedNextSteps: string[];
  sources: {
    evidence?: RuntimeGateAction;
    gate?: RuntimeGateAction;
  };
  meta: {
    workflowStepsCompleted: number;
    workflowStepsFailed: number;
    evidenceCoverageRatio: number;
    scoreRatio: number | null;
    unsupportedCount: number;
    gateEvidenceWeakCount: number;
    mandatoryUnsupportedCount?: number;
  };
};

export type TenderRuntimeWorkflowScoreBundle = {
  scoreResult: ReturnType<typeof computeTenderScore>;
  summary: BidDecisionSummary;
  gate: BidDecisionGateResult;
  gateText: string;
  risk: ReturnType<typeof computeTenderRiskFromRows>;
  profileSource: string;
  profileName: string;
};

export type TenderRuntimeWorkflowResult = {
  ok: true;
  workflowId: string;
  status: RuntimeStatus;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  steps: WorkflowStepResult[];
  graph?: TenderSemanticGraph;
  compliance?: TechnicalCompliancePackage;
  skuResult?: SKUIntelligenceResult;
  evidence?: EvidenceRuntimeResult;
  query?: EvidenceQueryResult;
  score?: TenderRuntimeWorkflowScoreBundle;
  decision: RuntimeDecision;
  recommendations: RuntimeRecommendation[];
  scoringImpact: RuntimeScoringImpact;
};

export type TenderRuntimeWorkflowError = {
  ok: false;
  workflowId: string;
  code: string;
  message: string;
  failedStep?: TenderWorkflowStepId;
  steps: WorkflowStepResult[];
};
