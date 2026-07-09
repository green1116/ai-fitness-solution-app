/**
 * V76 P4 — Collaboration constraint catalog types (read-only)
 */

export const V76_COLLABORATION_CONSTRAINT_VERSION =
  "v76-collaboration-constraint-catalog-1" as const;
export const V76_COLLABORATION_CONSTRAINT_FREEZE_VERSION =
  "v76-collaboration-constraint-catalog-freeze-1" as const;

export type CollaborationConstraintKind =
  | "shared"
  | "topology"
  | "communication"
  | "delegation"
  | "coordination"
  | "governance"
  | "workspace"
  | "boundary";

export type CollaborationConstraintLevel = "L1" | "L2" | "L3" | "critical";

export type CollaborationConstraintPriority = "low" | "medium" | "high" | "critical";

export type CollaborationConstraintValidation = {
  id: string;
  constraintRef: string;
  validationKind: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type CollaborationConstraintCatalogEntry = {
  id: string;
  kind: CollaborationConstraintKind;
  purpose: string;
  scopeRef: string;
  level: CollaborationConstraintLevel;
  trigger: string;
  condition: string;
  resolution: string;
  priority: CollaborationConstraintPriority;
  validation: string;
  inventoryConstraintRef: string;
  contextRef: string;
  policyRef: string;
  required: boolean;
  description: string;
};

export type CollaborationConstraintCatalogManifest = {
  version: typeof V76_COLLABORATION_CONSTRAINT_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  constraints: CollaborationConstraintCatalogEntry[];
  summary: string;
};

export type CollaborationConstraintValidationManifest = {
  version: typeof V76_COLLABORATION_CONSTRAINT_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  validations: CollaborationConstraintValidation[];
  summary: string;
};

export type CollaborationConstraintCatalogSignals = {
  collaborationContextCatalogReady?: boolean;
  catalogComplete?: boolean;
  validationsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type CollaborationConstraintCatalogReport = {
  version: typeof V76_COLLABORATION_CONSTRAINT_VERSION;
  freezeVersion: typeof V76_COLLABORATION_CONSTRAINT_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  collaborationContextCatalogVersion: string;
  collaborationContextCatalogReady: boolean;
  catalog: CollaborationConstraintCatalogManifest;
  validations: CollaborationConstraintValidationManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
