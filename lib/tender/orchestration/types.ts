import type {
  RuntimeDecision,
  RuntimeRecommendation,
  RuntimeScoringImpact,
  TenderRuntimeWorkflowResult,
  TenderRuntimeWorkflowError,
} from "@/lib/tender/runtime/types";
import type { SemanticEvidenceIntelligenceResult } from "@/lib/tender/semantic-evidence/types";
import type { ExternalEvidenceIntelligenceResult } from "@/lib/tender/evidence-intelligence/types";
import type { AttachmentInput } from "@/lib/tender/attachment-evidence/types";
import type { SemanticRuntimeReasoningResult } from "@/lib/tender/semantic-runtime/types";
import type { TenderRuntimeWorkflowInput } from "@/lib/tender/runtime/workflow/types";

/** V3.0 编排阶段 */
export type OrchestrationPhaseId =
  | "initialize"
  | "workflow"
  | "route"
  | "escalate"
  | "readiness"
  | "finalize";

export type OrchestrationPhaseStatus =
  | "pending"
  | "running"
  | "completed"
  | "skipped"
  | "failed";

export type OrchestrationPhaseResult = {
  phaseId: OrchestrationPhaseId;
  status: OrchestrationPhaseStatus;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  message: string;
  error?: string;
  metrics?: Record<string, number | string | boolean>;
};

/** 决策路由目标 */
export type DecisionRouteTarget = "proceed" | "review" | "hold" | "abort";

export type DecisionRouteTrigger =
  | "unified"
  | "evidence"
  | "gate"
  | "escalation"
  | "readiness"
  | "force";

export type DecisionRoute = {
  routeId: string;
  target: DecisionRouteTarget;
  label: string;
  reason: string;
  triggeredBy: DecisionRouteTrigger;
  priority: number;
};

export type EscalationLevel = "none" | "advisory" | "supervisor" | "executive";

export type EscalationResult = {
  level: EscalationLevel;
  required: boolean;
  triggers: string[];
  resolutionHints: string[];
  autoResolvable: boolean;
};

export type SubmissionChecklistStatus = "pass" | "warn" | "fail" | "skipped";

export type SubmissionChecklistItem = {
  id: string;
  label: string;
  status: SubmissionChecklistStatus;
  weight: number;
  detail?: string;
};

export type SubmissionReadiness = {
  ready: boolean;
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  blockers: string[];
  warnings: string[];
  checklist: SubmissionChecklistItem[];
};

export type FinalRuntimeVerdict =
  | "submit"
  | "conditional_submit"
  | "defer"
  | "abort";

export type OrchestrationStatus = "completed" | "partial" | "failed";

export type FinalRuntimeOutcome = {
  outcomeId: string;
  verdict: FinalRuntimeVerdict;
  orchestrationStatus: OrchestrationStatus;
  summary: string;
  nextActions: string[];
  decision: RuntimeDecision;
  route: DecisionRoute;
  escalation: EscalationResult;
  readiness: SubmissionReadiness;
};

export type TenderOrchestrationInput = TenderRuntimeWorkflowInput & {
  planId?: string;
  orchestrationPolicy?: Partial<OrchestrationPolicy>;
  /** V3.1 是否在编排后运行语义证据推理 */
  runSemanticEvidence?: boolean;
  /** V3.2 是否在编排后运行语义运行时推理（依赖 semanticEvidence 或 workflow.graph） */
  runSemanticRuntime?: boolean;
  /** V3.3 外部附件证据摄入 */
  attachments?: AttachmentInput[];
};

export type OrchestrationPolicy = {
  minReadinessScore: number;
  allowConditionalSubmit: boolean;
  escalateOnWarn: boolean;
  blockVerdictOnEscalation: boolean;
};

export type TenderOrchestrationResult = {
  ok: true;
  orchestrationId: string;
  version: "3.0";
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  phases: OrchestrationPhaseResult[];
  workflow: TenderRuntimeWorkflowResult;
  route: DecisionRoute;
  escalation: EscalationResult;
  readiness: SubmissionReadiness;
  outcome: FinalRuntimeOutcome;
  recommendations: RuntimeRecommendation[];
  scoringImpact: RuntimeScoringImpact;
  semanticEvidence?: SemanticEvidenceIntelligenceResult;
  semanticRuntime?: SemanticRuntimeReasoningResult;
  externalEvidence?: ExternalEvidenceIntelligenceResult;
  /** @deprecated 使用 externalEvidence */
  attachmentEvidence?: ExternalEvidenceIntelligenceResult;
};

export type TenderOrchestrationError = {
  ok: false;
  orchestrationId: string;
  code: string;
  message: string;
  failedPhase?: OrchestrationPhaseId;
  phases: OrchestrationPhaseResult[];
  workflowError?: TenderRuntimeWorkflowError;
};
