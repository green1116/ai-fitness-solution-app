/**
 * V75 P3 — Agent context catalog types (read-only)
 */

export const V75_AGENT_CONTEXT_VERSION = "v75-agent-context-catalog-1" as const;
export const V75_AGENT_CONTEXT_FREEZE_VERSION = "v75-agent-context-catalog-freeze-1" as const;

export type AgentContextDomainKind =
  | "user"
  | "workspace"
  | "organization"
  | "task"
  | "session"
  | "orchestration"
  | "environment"
  | "history";

export type AgentContextLifecycle = "ephemeral" | "session" | "persistent" | "archived";

export type AgentContextPriority = "low" | "medium" | "high" | "critical";

export type AgentContextValidation = {
  id: string;
  contextRef: string;
  validationKind: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type AgentContextCatalogEntry = {
  id: string;
  domain: AgentContextDomainKind;
  purpose: string;
  sourceRef: string;
  lifecycle: AgentContextLifecycle;
  inputs: string[];
  outputs: string[];
  priority: AgentContextPriority;
  dependencies: string[];
  validation: string;
  inventoryContextRef: string;
  policyRef: string;
  scopeRef: string;
  required: boolean;
  description: string;
};

export type AgentContextCatalogManifest = {
  version: typeof V75_AGENT_CONTEXT_VERSION;
  entryCount: number;
  domainCount: number;
  catalogComplete: boolean;
  contexts: AgentContextCatalogEntry[];
  summary: string;
};

export type AgentContextValidationManifest = {
  version: typeof V75_AGENT_CONTEXT_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  validations: AgentContextValidation[];
  summary: string;
};

export type AgentContextCatalogSignals = {
  agentPolicyCatalogReady?: boolean;
  catalogComplete?: boolean;
  validationsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type AgentContextCatalogReport = {
  version: typeof V75_AGENT_CONTEXT_VERSION;
  freezeVersion: typeof V75_AGENT_CONTEXT_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  agentPolicyCatalogVersion: string;
  agentPolicyCatalogReady: boolean;
  catalog: AgentContextCatalogManifest;
  validations: AgentContextValidationManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
