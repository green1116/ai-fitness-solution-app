/**
 * V75 P5 — Agent evaluation catalog types (read-only)
 */

export const V75_AGENT_EVALUATION_VERSION = "v75-agent-evaluation-catalog-1" as const;
export const V75_AGENT_EVALUATION_FREEZE_VERSION =
  "v75-agent-evaluation-catalog-freeze-1" as const;

export type AgentEvaluationDimensionKind =
  | "score"
  | "confidence"
  | "risk"
  | "quality"
  | "cost"
  | "benefit"
  | "impact"
  | "explainability";

export type AgentEvaluationPriority = "low" | "medium" | "high" | "critical";

export type AgentEvaluationValidation = {
  id: string;
  evaluationRef: string;
  validationKind: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type AgentEvaluationCatalogEntry = {
  id: string;
  dimension: AgentEvaluationDimensionKind;
  purpose: string;
  inputs: string[];
  outputs: string[];
  metrics: string[];
  threshold: string;
  passRule: string;
  priority: AgentEvaluationPriority;
  validation: string;
  constraintRef: string;
  contextRef: string;
  required: boolean;
  description: string;
};

export type AgentEvaluationCatalogManifest = {
  version: typeof V75_AGENT_EVALUATION_VERSION;
  entryCount: number;
  dimensionCount: number;
  catalogComplete: boolean;
  evaluations: AgentEvaluationCatalogEntry[];
  summary: string;
};

export type AgentEvaluationValidationManifest = {
  version: typeof V75_AGENT_EVALUATION_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  validations: AgentEvaluationValidation[];
  summary: string;
};

export type AgentEvaluationCatalogSignals = {
  agentConstraintCatalogReady?: boolean;
  catalogComplete?: boolean;
  validationsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type AgentEvaluationCatalogReport = {
  version: typeof V75_AGENT_EVALUATION_VERSION;
  freezeVersion: typeof V75_AGENT_EVALUATION_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  agentConstraintCatalogVersion: string;
  agentConstraintCatalogReady: boolean;
  catalog: AgentEvaluationCatalogManifest;
  validations: AgentEvaluationValidationManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
