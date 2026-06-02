import type { EvidenceCoverageStatus, EvidenceRegistry, EvidenceType } from "@/lib/tender/evidence/types";
import type { TenderSemanticGraph } from "@/lib/tender/semantic/types";

/** V3.1 语义证据节点生命周期 */
export type SemanticEvidenceLifecycleState =
  | "discovered"
  | "needed"
  | "partially_linked"
  | "linked"
  | "verified"
  | "gap";

export type SemanticEvidenceNodeKind =
  | "requirement"
  | "scoring"
  | "risk"
  | "section"
  | "evidence"
  | "compliance"
  | "need";

export type SemanticEvidenceRelation =
  | "requires_evidence"
  | "satisfied_by"
  | "supports_scoring"
  | "mitigates_risk"
  | "relates_to"
  | "derived_from";

export type EvidenceNeedPriority = "mandatory" | "preferred" | "optional";

export type EvidenceNeedSource =
  | "requirement"
  | "scoring"
  | "risk"
  | "compliance"
  | "section";

/** 语义层推断的 evidence 需求（非 AI 生成） */
export type SemanticEvidenceNeed = {
  id: string;
  requirementId: string;
  requirementText: string;
  expectedTypes: EvidenceType[];
  priority: EvidenceNeedPriority;
  source: EvidenceNeedSource;
  rationale: string;
  relatedScoringItemIds?: string[];
  relatedRiskIds?: string[];
};

export type SemanticEvidenceNode = {
  id: string;
  nodeKind: SemanticEvidenceNodeKind;
  refId: string;
  label: string;
  lifecycle: SemanticEvidenceLifecycleState;
  linkedEvidenceIds: string[];
  evidenceNeeds?: string[];
  category?: string;
  importance?: string;
};

export type SemanticEvidenceEdge = {
  id: string;
  from: string;
  to: string;
  relation: SemanticEvidenceRelation;
  confidence: number;
  rationale?: string;
};

/** V3.1 语义执行图（Runtime Execution Graph） */
export type SemanticEvidenceExecutionGraph = {
  nodes: SemanticEvidenceNode[];
  edges: SemanticEvidenceEdge[];
  summary: {
    nodeCount: number;
    edgeCount: number;
    requirementNodes: number;
    evidenceNodes: number;
    gapNodes: number;
  };
};

export type SemanticInferenceRuleId =
  | "requirement.evidence_required"
  | "requirement.measurable_technical"
  | "requirement.qualification"
  | "scoring.evidence_needed"
  | "risk.high_severity"
  | "compliance.missing"
  | "registry.link_satisfaction";

export type SemanticInference = {
  id: string;
  ruleId: SemanticInferenceRuleId;
  subjectNodeId: string;
  conclusion: string;
  confidence: number;
  relatedEvidenceIds?: string[];
};

export type SemanticReasoningStepId =
  | "build_graph"
  | "infer_needs"
  | "bind_registry"
  | "evaluate_coverage"
  | "emit_gaps";

export type SemanticReasoningStep = {
  stepId: SemanticReasoningStepId;
  message: string;
  at: string;
  metrics?: Record<string, number | string | boolean>;
};

export type SemanticEvidenceCoverageRow = {
  requirementId: string;
  requirementText: string;
  semanticStatus: EvidenceCoverageStatus;
  registryStatus?: EvidenceCoverageStatus;
  aligned: boolean;
  satisfiedNeeds: number;
  totalNeeds: number;
  missingTypes: EvidenceType[];
  notes: string[];
};

export type SemanticEvidenceCoverageSummary = {
  rows: SemanticEvidenceCoverageRow[];
  fullyEvidenced: number;
  partiallyEvidenced: number;
  unsupported: number;
  risky: number;
  alignmentRatio: number;
};

/** V3.1 Runtime Context */
export type SemanticEvidenceContext = {
  contextId: string;
  createdAt: string;
  graph: TenderSemanticGraph;
  registry?: EvidenceRegistry;
  sourceName?: string | null;
};

export type SemanticEvidenceIntelligenceResult = {
  version: "3.1";
  context: SemanticEvidenceContext;
  executionGraph: SemanticEvidenceExecutionGraph;
  evidenceNeeds: SemanticEvidenceNeed[];
  inferences: SemanticInference[];
  coverage: SemanticEvidenceCoverageSummary;
  reasoningTrace: SemanticReasoningStep[];
  ranAt: string;
};

export type SemanticEvidenceIntelligenceInput = {
  graph: TenderSemanticGraph;
  registry?: EvidenceRegistry;
  sourceName?: string | null;
};
