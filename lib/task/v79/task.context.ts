/**
 * V79 P3 — Task context catalog types (read-only)
 */

export const V79_TASK_CONTEXT_VERSION = "v79-task-context-catalog-1" as const;
export const V79_TASK_CONTEXT_FREEZE_VERSION = "v79-task-context-catalog-freeze-1" as const;

export type TaskContextDomainKind =
  | "shared"
  | "role"
  | "state"
  | "topology"
  | "scope"
  | "dependency"
  | "governance"
  | "boundary";

export type TaskContextLifecycle = "ephemeral" | "session" | "persistent" | "archived";

export type TaskContextPriority = "low" | "medium" | "high" | "critical";

export type TaskContextValidation = {
  id: string;
  contextRef: string;
  validationKind: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type TaskContextCatalogEntry = {
  id: string;
  domain: TaskContextDomainKind;
  purpose: string;
  lifecycle: TaskContextLifecycle;
  ownership: string;
  boundary: string;
  readWriteRule: string;
  provenance: string;
  roleRef: string;
  stateRef: string;
  topologyRef: string;
  governanceRef: string;
  priority: TaskContextPriority;
  dependencies: string[];
  validation: string;
  inventoryRoleRef: string;
  policyRef: string;
  scopeRef: string;
  required: boolean;
  description: string;
};

export type TaskContextCatalogManifest = {
  version: typeof V79_TASK_CONTEXT_VERSION;
  entryCount: number;
  domainCount: number;
  catalogComplete: boolean;
  contexts: TaskContextCatalogEntry[];
  summary: string;
};

export type TaskContextValidationManifest = {
  version: typeof V79_TASK_CONTEXT_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  validations: TaskContextValidation[];
  summary: string;
};

export type TaskContextCatalogSignals = {
  taskPolicyCatalogReady?: boolean;
  catalogComplete?: boolean;
  validationsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type TaskContextCatalogReport = {
  version: typeof V79_TASK_CONTEXT_VERSION;
  freezeVersion: typeof V79_TASK_CONTEXT_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  taskPolicyCatalogVersion: string;
  taskPolicyCatalogReady: boolean;
  catalog: TaskContextCatalogManifest;
  validations: TaskContextValidationManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
