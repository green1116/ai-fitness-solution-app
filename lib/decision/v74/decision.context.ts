/**
 * V74 P3 — Decision context catalog types (read-only)
 */

export const V74_DECISION_CONTEXT_VERSION = "v74-decision-context-catalog-1" as const;
export const V74_DECISION_CONTEXT_FREEZE_VERSION = "v74-decision-context-catalog-freeze-1" as const;

export type ContextDomainKind =
  | "user"
  | "workspace"
  | "organization"
  | "knowledge"
  | "runtime"
  | "workflow"
  | "environment"
  | "history";

export type ContextPriority = "low" | "medium" | "high" | "critical";

export type ContextValidation = {
  id: string;
  contextRef: string;
  validationKind: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type ContextCatalogEntry = {
  id: string;
  domain: ContextDomainKind;
  purpose: string;
  inputs: string[];
  outputs: string[];
  priority: ContextPriority;
  dependencies: string[];
  validation: string;
  inventoryContextRef: string;
  policyRef: string;
  scopeRef: string;
  required: boolean;
  description: string;
};

export type ContextCatalogManifest = {
  version: typeof V74_DECISION_CONTEXT_VERSION;
  entryCount: number;
  domainCount: number;
  catalogComplete: boolean;
  contexts: ContextCatalogEntry[];
  summary: string;
};

export type ContextValidationManifest = {
  version: typeof V74_DECISION_CONTEXT_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  validations: ContextValidation[];
  summary: string;
};

export type DecisionContextCatalogSignals = {
  decisionPolicyCatalogReady?: boolean;
  catalogComplete?: boolean;
  validationsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type DecisionContextCatalogReport = {
  version: typeof V74_DECISION_CONTEXT_VERSION;
  freezeVersion: typeof V74_DECISION_CONTEXT_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  decisionPolicyCatalogVersion: string;
  decisionPolicyCatalogReady: boolean;
  catalog: ContextCatalogManifest;
  validations: ContextValidationManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
