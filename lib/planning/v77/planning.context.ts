/**
 * V77 P3 — Planning context catalog types (read-only)
 */

export const V77_PLANNING_CONTEXT_VERSION = "v77-planning-context-catalog-1" as const;
export const V77_PLANNING_CONTEXT_FREEZE_VERSION =
  "v77-planning-context-catalog-freeze-1" as const;

export type PlanningContextDomainKind =
  | "shared"
  | "role"
  | "topology"
  | "scope"
  | "dependency"
  | "governance"
  | "workspace"
  | "boundary";

export type PlanningContextLifecycle = "ephemeral" | "session" | "persistent" | "archived";

export type PlanningContextPriority = "low" | "medium" | "high" | "critical";

export type PlanningContextValidation = {
  id: string;
  contextRef: string;
  validationKind: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type PlanningContextCatalogEntry = {
  id: string;
  domain: PlanningContextDomainKind;
  purpose: string;
  lifecycle: PlanningContextLifecycle;
  ownership: string;
  boundary: string;
  readWriteRule: string;
  provenance: string;
  roleRef: string;
  topologyRef: string;
  governanceRef: string;
  priority: PlanningContextPriority;
  dependencies: string[];
  validation: string;
  inventoryRoleRef: string;
  policyRef: string;
  scopeRef: string;
  required: boolean;
  description: string;
};

export type PlanningContextCatalogManifest = {
  version: typeof V77_PLANNING_CONTEXT_VERSION;
  entryCount: number;
  domainCount: number;
  catalogComplete: boolean;
  contexts: PlanningContextCatalogEntry[];
  summary: string;
};

export type PlanningContextValidationManifest = {
  version: typeof V77_PLANNING_CONTEXT_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  validations: PlanningContextValidation[];
  summary: string;
};

export type PlanningContextCatalogSignals = {
  planningPolicyCatalogReady?: boolean;
  catalogComplete?: boolean;
  validationsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type PlanningContextCatalogReport = {
  version: typeof V77_PLANNING_CONTEXT_VERSION;
  freezeVersion: typeof V77_PLANNING_CONTEXT_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  planningPolicyCatalogVersion: string;
  planningPolicyCatalogReady: boolean;
  catalog: PlanningContextCatalogManifest;
  validations: PlanningContextValidationManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
