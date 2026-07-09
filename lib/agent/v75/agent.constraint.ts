/**
 * V75 P4 — Agent constraint catalog types (read-only)
 */

export const V75_AGENT_CONSTRAINT_VERSION = "v75-agent-constraint-catalog-1" as const;
export const V75_AGENT_CONSTRAINT_FREEZE_VERSION =
  "v75-agent-constraint-catalog-freeze-1" as const;

export type AgentConstraintTypeKind =
  | "hardRule"
  | "softRule"
  | "priority"
  | "conflict"
  | "dependency"
  | "limit"
  | "precondition"
  | "postcondition";

export type AgentConstraintLevel = "L1" | "L2" | "L3" | "critical";

export type AgentConstraintPriority = "low" | "medium" | "high" | "critical";

export type AgentConstraintValidation = {
  id: string;
  constraintRef: string;
  validationKind: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type AgentConstraintCatalogEntry = {
  id: string;
  type: AgentConstraintTypeKind;
  purpose: string;
  scopeRef: string;
  level: AgentConstraintLevel;
  trigger: string;
  condition: string;
  resolution: string;
  priority: AgentConstraintPriority;
  validation: string;
  inventoryConstraintRef: string;
  contextRef: string;
  policyRef: string;
  required: boolean;
  description: string;
};

export type AgentConstraintCatalogManifest = {
  version: typeof V75_AGENT_CONSTRAINT_VERSION;
  entryCount: number;
  typeCount: number;
  catalogComplete: boolean;
  constraints: AgentConstraintCatalogEntry[];
  summary: string;
};

export type AgentConstraintValidationManifest = {
  version: typeof V75_AGENT_CONSTRAINT_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  validations: AgentConstraintValidation[];
  summary: string;
};

export type AgentConstraintCatalogSignals = {
  agentContextCatalogReady?: boolean;
  catalogComplete?: boolean;
  validationsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type AgentConstraintCatalogReport = {
  version: typeof V75_AGENT_CONSTRAINT_VERSION;
  freezeVersion: typeof V75_AGENT_CONSTRAINT_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  agentContextCatalogVersion: string;
  agentContextCatalogReady: boolean;
  catalog: AgentConstraintCatalogManifest;
  validations: AgentConstraintValidationManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
