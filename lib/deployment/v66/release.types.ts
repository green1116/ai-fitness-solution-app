/**
 * V66 P4 — Release orchestration & rollback guard types (read-only)
 */

export const V66_RELEASE_ORCHESTRATION_VERSION = "v66-release-orchestration-1" as const;

export type RolloutStageStatus = "pending" | "pass" | "fail" | "skipped";

export type RolloutStageKind = "verify" | "gate" | "observability" | "orchestration" | "cutover";

export type RollbackGuardSeverity = "critical" | "high" | "medium";

export type RollbackGuardStatus = "armed" | "tripped" | "clear";

export type ReleaseOrchestrationSignals = {
  observabilityReady?: boolean;
  manifestComplete?: boolean;
  rolloutStagesComplete?: boolean;
  rollbackGuardIntact?: boolean;
};

export type ReleaseLayerEntry = {
  phase: string;
  version: string;
  module: string;
  verifyScript: string;
  frozen: boolean;
};

export type ReleaseManifest = {
  version: typeof V66_RELEASE_ORCHESTRATION_VERSION;
  manifestId: string;
  deploymentId: string;
  upstreamFrozen: Record<string, string>;
  layers: ReleaseLayerEntry[];
  layerCount: number;
  manifestComplete: boolean;
  summary: string;
};

export type RolloutStage = {
  id: string;
  order: number;
  label: string;
  kind: RolloutStageKind;
  target: string;
  required: boolean;
  status: RolloutStageStatus;
  notes?: string;
};

export type RolloutStageManifest = {
  version: typeof V66_RELEASE_ORCHESTRATION_VERSION;
  stageCount: number;
  passCount: number;
  sequenceComplete: boolean;
  stages: RolloutStage[];
  summary: string;
};

export type RollbackGuardRule = {
  id: string;
  label: string;
  severity: RollbackGuardSeverity;
  required: boolean;
  status: RollbackGuardStatus;
  rollbackAction: string;
  notes?: string;
};

export type RollbackGuardManifest = {
  version: typeof V66_RELEASE_ORCHESTRATION_VERSION;
  ruleCount: number;
  armedCount: number;
  guardIntact: boolean;
  rules: RollbackGuardRule[];
  summary: string;
};

export type ReleaseOrchestrationReport = {
  version: typeof V66_RELEASE_ORCHESTRATION_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  observabilityVersion: string;
  observabilityReady: boolean;
  releaseManifest: ReleaseManifest;
  rolloutStages: RolloutStageManifest;
  rollbackGuard: RollbackGuardManifest;
  orchestrationReady: boolean;
  readinessScore: number;
  summary: string;
};
