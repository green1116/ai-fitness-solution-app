/**
 * V71 P1 — Orchestration catalog types (read-only)
 */

export const V71_ORCHESTRATION_VERSION = "v71-orchestration-catalog-1" as const;
export const V71_ORCHESTRATION_FREEZE_VERSION = "v71-orchestration-catalog-freeze-1" as const;

export type OrchestrationStatus = "draft" | "active" | "paused" | "archived";

export type WorkflowPhase =
  | "init"
  | "validate"
  | "execute"
  | "verify"
  | "finalize"
  | "rollback";

export type TriggerKind = "manual" | "schedule" | "event" | "webhook" | "gate-pass";

export type ActionKind =
  | "catalog-build"
  | "dependency-resolve"
  | "policy-check"
  | "compatibility-scan"
  | "upgrade-plan"
  | "lifecycle-transition"
  | "compliance-audit"
  | "signoff-freeze";

export type StepDisposition = "sequential" | "parallel" | "conditional" | "terminal";

export type OrchestrationRetry = {
  maxAttempts: number;
  backoff: "linear" | "exponential" | "none";
  interval: string;
};

export type OrchestrationCatalogEntry = {
  id: string;
  orchestration: string;
  workflow: string;
  trigger: TriggerKind;
  action: ActionKind;
  step: string;
  owner: string;
  status: OrchestrationStatus;
  input: string;
  output: string;
  retry: OrchestrationRetry;
  timeout: string;
  required: boolean;
  description: string;
};

export type OrchestrationCatalogManifest = {
  version: typeof V71_ORCHESTRATION_VERSION;
  entryCount: number;
  triggerCount: number;
  actionCount: number;
  catalogComplete: boolean;
  orchestrations: OrchestrationCatalogEntry[];
  summary: string;
};

export type OrchestrationCatalogSignals = {
  catalogComplete?: boolean;
  freezeVersionDeclared?: boolean;
};

export type OrchestrationCatalogReport = {
  version: typeof V71_ORCHESTRATION_VERSION;
  freezeVersion: typeof V71_ORCHESTRATION_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  manifest: OrchestrationCatalogManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
