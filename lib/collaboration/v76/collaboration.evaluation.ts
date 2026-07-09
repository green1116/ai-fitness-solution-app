/**
 * V76 P5 — Collaboration evaluation catalog types (read-only)
 */

export const V76_COLLABORATION_EVALUATION_VERSION =
  "v76-collaboration-evaluation-catalog-1" as const;
export const V76_COLLABORATION_EVALUATION_FREEZE_VERSION =
  "v76-collaboration-evaluation-catalog-freeze-1" as const;

export type CollaborationEvaluationKind =
  | "shared"
  | "topology"
  | "communication"
  | "delegation"
  | "coordination"
  | "governance"
  | "workspace"
  | "boundary";

export type CollaborationEvaluationPriority = "low" | "medium" | "high" | "critical";

export type CollaborationEvaluationValidation = {
  id: string;
  evaluationRef: string;
  validationKind: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type CollaborationEvaluationCatalogEntry = {
  id: string;
  kind: CollaborationEvaluationKind;
  purpose: string;
  inputs: string[];
  outputs: string[];
  metrics: string[];
  threshold: string;
  passRule: string;
  priority: CollaborationEvaluationPriority;
  validation: string;
  constraintRef: string;
  contextRef: string;
  required: boolean;
  description: string;
};

export type CollaborationEvaluationCatalogManifest = {
  version: typeof V76_COLLABORATION_EVALUATION_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  evaluations: CollaborationEvaluationCatalogEntry[];
  summary: string;
};

export type CollaborationEvaluationValidationManifest = {
  version: typeof V76_COLLABORATION_EVALUATION_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  validations: CollaborationEvaluationValidation[];
  summary: string;
};

export type CollaborationEvaluationCatalogSignals = {
  collaborationConstraintCatalogReady?: boolean;
  catalogComplete?: boolean;
  validationsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type CollaborationEvaluationCatalogReport = {
  version: typeof V76_COLLABORATION_EVALUATION_VERSION;
  freezeVersion: typeof V76_COLLABORATION_EVALUATION_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  collaborationConstraintCatalogVersion: string;
  collaborationConstraintCatalogReady: boolean;
  catalog: CollaborationEvaluationCatalogManifest;
  validations: CollaborationEvaluationValidationManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
