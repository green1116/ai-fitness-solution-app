import type { EvidenceType } from "@/lib/tender/evidence/types";
import type { SemanticEvidenceIntelligenceResult } from "@/lib/tender/semantic-evidence/types";

/** V3.2 语义运行时推理阶段 */
export type SemanticRuntimePhaseId =
  | "vocabulary"
  | "intent"
  | "profile"
  | "match"
  | "coverage"
  | "decide";

export type SemanticRuntimePhaseResult = {
  phaseId: SemanticRuntimePhaseId;
  status: "completed" | "skipped" | "failed";
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  message: string;
  metrics?: Record<string, number | string | boolean>;
};

/** 语义词汇表（确定性抽取） */
export type SemanticVocabulary = {
  categories: string[];
  evidenceTypes: EvidenceType[];
  phases: string[];
  importanceLevels: string[];
  keywords: string[];
  termCount: number;
};

export type RequirementIntentType =
  | "prove_capability"
  | "demonstrate_compliance"
  | "mitigate_risk"
  | "score_points"
  | "attach_proof"
  | "general";

export type RequirementIntent = {
  requirementId: string;
  intentType: RequirementIntentType;
  priority: "mandatory" | "preferred" | "optional";
  keywords: string[];
  expectedEvidenceTypes: EvidenceType[];
  measurable: boolean;
  evidenceRequired: boolean;
};

export type EvidenceSemanticProfile = {
  evidenceId: string;
  title: string;
  evidenceType: EvidenceType;
  semanticTags: string[];
  strengthScore: number;
  matchedIntentTypes: RequirementIntentType[];
  linkedRequirementIds: string[];
};

export type SemanticMatchResult = {
  requirementId: string;
  evidenceId: string;
  matchScore: number;
  matchedBy: "type" | "keyword" | "intent" | "registry_link";
  intentType?: RequirementIntentType;
};

export type SemanticRuntimeGateAction = "allow" | "warn" | "block";

export type SemanticRuntimeDecision = {
  action: SemanticRuntimeGateAction;
  passed: boolean;
  title: string;
  message: string;
  reasons: string[];
  suggestedActions: string[];
  meta: {
    intentCount: number;
    profileCount: number;
    matchCount: number;
    gapCount: number;
    mandatoryGapCount: number;
    coverageRatio: number;
    alignmentRatio: number;
    avgMatchScore: number;
  };
};

export type SemanticRuntimeReasoningInput = {
  intelligence?: SemanticEvidenceIntelligenceResult;
  graph?: import("@/lib/tender/semantic/types").TenderSemanticGraph;
  registry?: import("@/lib/tender/evidence/types").EvidenceRegistry;
  sourceName?: string | null;
  policy?: Partial<SemanticRuntimePolicy>;
  forceAllow?: boolean;
};

export type SemanticRuntimePolicy = {
  blockOnMandatoryGapCount: number;
  blockOnGapRatio: number;
  warnOnMisalignmentRatio: number;
  minAvgMatchScore: number;
};

export type SemanticRuntimeReasoningResult = {
  version: "3.2";
  ranAt: string;
  phases: SemanticRuntimePhaseResult[];
  vocabulary: SemanticVocabulary;
  intents: RequirementIntent[];
  profiles: EvidenceSemanticProfile[];
  matches: SemanticMatchResult[];
  intelligence: SemanticEvidenceIntelligenceResult;
  decision: SemanticRuntimeDecision;
};
