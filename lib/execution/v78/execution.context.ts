/**
 * V78 P3 — Execution context catalog types (read-only)
 */

export const V78_EXECUTION_CONTEXT_VERSION = "v78-execution-context-catalog-1" as const;
export const V78_EXECUTION_CONTEXT_FREEZE_VERSION =
  "v78-execution-context-catalog-freeze-1" as const;

export type ExecutionContextDomainKind =
  | "shared"
  | "role"
  | "topology"
  | "scope"
  | "dependency"
  | "governance"
  | "workspace"
  | "boundary";

export type ExecutionContextLifecycle = "ephemeral" | "session" | "persistent" | "archived";

export type ExecutionContextPriority = "low" | "medium" | "high" | "critical";

export type ExecutionContextValidation = {
  id: string;
  contextRef: string;
  validationKind: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type ExecutionContextCatalogEntry = {
  id: string;
  domain: ExecutionContextDomainKind;
  purpose: string;
  lifecycle: ExecutionContextLifecycle;
  ownership: string;
  boundary: string;
  readWriteRule: string;
  provenance: string;
  roleRef: string;
  topologyRef: string;
  governanceRef: string;
  priority: ExecutionContextPriority;
  dependencies: string[];
  validation: string;
  inventoryRoleRef: string;
  policyRef: string;
  scopeRef: string;
  required: boolean;
  description: string;
};

export type ExecutionContextCatalogManifest = {
  version: typeof V78_EXECUTION_CONTEXT_VERSION;
  entryCount: number;
  domainCount: number;
  catalogComplete: boolean;
  contexts: ExecutionContextCatalogEntry[];
  summary: string;
};

export type ExecutionContextValidationManifest = {
  version: typeof V78_EXECUTION_CONTEXT_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  validations: ExecutionContextValidation[];
  summary: string;
};

export type ExecutionContextCatalogSignals = {
  executionPolicyCatalogReady?: boolean;
  catalogComplete?: boolean;
  validationsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type ExecutionContextCatalogReport = {
  version: typeof V78_EXECUTION_CONTEXT_VERSION;
  freezeVersion: typeof V78_EXECUTION_CONTEXT_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  executionPolicyCatalogVersion: string;
  executionPolicyCatalogReady: boolean;
  catalog: ExecutionContextCatalogManifest;
  validations: ExecutionContextValidationManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
