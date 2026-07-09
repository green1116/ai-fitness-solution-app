/**
 * V76 P3 — Collaboration context catalog types (read-only)
 */

export const V76_COLLABORATION_CONTEXT_VERSION = "v76-collaboration-context-catalog-1" as const;
export const V76_COLLABORATION_CONTEXT_FREEZE_VERSION =
  "v76-collaboration-context-catalog-freeze-1" as const;

export type CollaborationContextDomainKind =
  | "shared"
  | "ownership"
  | "boundary"
  | "lifecycle"
  | "readWrite"
  | "provenance"
  | "governance"
  | "workspace";

export type CollaborationContextLifecycle = "ephemeral" | "session" | "persistent" | "archived";

export type CollaborationContextPriority = "low" | "medium" | "high" | "critical";

export type CollaborationContextValidation = {
  id: string;
  contextRef: string;
  validationKind: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type CollaborationContextCatalogEntry = {
  id: string;
  domain: CollaborationContextDomainKind;
  purpose: string;
  sourceRef: string;
  lifecycle: CollaborationContextLifecycle;
  ownership: string;
  boundary: string;
  readWriteRule: string;
  provenance: string;
  inputs: string[];
  outputs: string[];
  priority: CollaborationContextPriority;
  dependencies: string[];
  validation: string;
  inventoryContextRef: string;
  policyRef: string;
  scopeRef: string;
  required: boolean;
  description: string;
};

export type CollaborationContextCatalogManifest = {
  version: typeof V76_COLLABORATION_CONTEXT_VERSION;
  entryCount: number;
  domainCount: number;
  catalogComplete: boolean;
  contexts: CollaborationContextCatalogEntry[];
  summary: string;
};

export type CollaborationContextValidationManifest = {
  version: typeof V76_COLLABORATION_CONTEXT_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  validations: CollaborationContextValidation[];
  summary: string;
};

export type CollaborationContextCatalogSignals = {
  collaborationPolicyCatalogReady?: boolean;
  catalogComplete?: boolean;
  validationsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type CollaborationContextCatalogReport = {
  version: typeof V76_COLLABORATION_CONTEXT_VERSION;
  freezeVersion: typeof V76_COLLABORATION_CONTEXT_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  collaborationPolicyCatalogVersion: string;
  collaborationPolicyCatalogReady: boolean;
  catalog: CollaborationContextCatalogManifest;
  validations: CollaborationContextValidationManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
