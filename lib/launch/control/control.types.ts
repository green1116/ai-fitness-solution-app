/**
 * Launch P7 — Launch Control Plane types
 */

import type {
  CONTROL_MANAGER_STATUSES,
  CONTROL_READINESS_VERDICTS,
  DEPLOYMENT_AGG_STATUSES,
  GONGO_VERDICTS,
  LAUNCH_CONTROL_PLANE_BASE,
  LAUNCH_CONTROL_PLANE_FREEZE_VERSION,
  LAUNCH_CONTROL_PLANE_ID,
  LAUNCH_CONTROL_PLANE_VERSION,
  ORCHESTRATION_STAGES,
  ORCHESTRATION_STATUSES,
  RELEASE_DECISION_VERDICTS,
} from "./control.constants";

export type OrchestrationStatus = (typeof ORCHESTRATION_STATUSES)[number];
export type OrchestrationStage = (typeof ORCHESTRATION_STAGES)[number];
export type ReleaseDecisionVerdict =
  (typeof RELEASE_DECISION_VERDICTS)[number];
export type GoNoGoVerdict = (typeof GONGO_VERDICTS)[number];
export type DeploymentAggStatus = (typeof DEPLOYMENT_AGG_STATUSES)[number];
export type ControlReadinessVerdict =
  (typeof CONTROL_READINESS_VERDICTS)[number];
export type ControlManagerStatus = (typeof CONTROL_MANAGER_STATUSES)[number];

export type ControlMetadata = Record<string, unknown>;

/** Launch orchestration model. */
export type OrchestrationStageRecord = {
  stage: OrchestrationStage;
  status: "PENDING" | "READY" | "BLOCKED" | "SKIPPED";
  detail: string;
  refId?: string;
};

export type LaunchOrchestration = {
  id: string;
  name: string;
  productId: string;
  productionProfileId: string;
  onboardingProfileId?: string;
  demoTenantId?: string;
  securityProfileId?: string;
  supportSlaProfileId?: string;
  documentationPackageId?: string;
  deploymentPackageId?: string;
  status: OrchestrationStatus;
  stages: OrchestrationStageRecord[];
  metadata: ControlMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateLaunchOrchestrationInput = {
  id?: string;
  name: string;
  productId: string;
  productionProfileId: string;
  onboardingProfileId?: string;
  demoTenantId?: string;
  securityProfileId?: string;
  supportSlaProfileId?: string;
  documentationPackageId?: string;
  deploymentPackageId?: string;
  status?: OrchestrationStatus;
  metadata?: ControlMetadata;
};

/** Release decision model. */
export type ReleaseDecision = {
  id: string;
  orchestrationId: string;
  verdict: ReleaseDecisionVerdict;
  rationale: string;
  decidedBy: string;
  conditions: string[];
  decidedAt: string;
};

export type CreateReleaseDecisionInput = {
  id?: string;
  orchestrationId: string;
  verdict: ReleaseDecisionVerdict;
  rationale: string;
  decidedBy: string;
  conditions?: string[];
};

/** Go / No-Go evaluation. */
export type GoNoGoCheck = {
  id: string;
  domain: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type GoNoGoResult = {
  orchestrationId: string;
  verdict: GoNoGoVerdict;
  passCount: number;
  failCount: number;
  checks: GoNoGoCheck[];
  summary: string;
  evaluatedAt: string;
};

/** Launch metrics. */
export type LaunchMetrics = {
  orchestrationId: string;
  stageReadyCount: number;
  stageBlockedCount: number;
  stagePendingCount: number;
  goNoGoVerdict?: GoNoGoVerdict;
  releaseVerdict?: ReleaseDecisionVerdict;
  readinessScore: number;
  computedAt: string;
};

/** Deployment status aggregation. */
export type DeploymentStatusAggregate = {
  orchestrationId: string;
  deploymentPackageId?: string;
  packageStatus?: string;
  productionReadiness?: string;
  aggregateStatus: DeploymentAggStatus;
  signals: Array<{ source: string; status: string; detail: string }>;
  aggregatedAt: string;
};

/** Executive dashboard. */
export type ExecutiveDashboard = {
  orchestrationId: string;
  productId: string;
  orchestrationStatus: OrchestrationStatus;
  goNoGo: GoNoGoVerdict;
  releaseDecision?: ReleaseDecisionVerdict;
  deploymentStatus: DeploymentAggStatus;
  domainScores: Array<{ domain: string; ready: boolean; detail: string }>;
  metrics: LaunchMetrics;
  headline: string;
  generatedAt: string;
};

/** Control readiness. */
export type ControlReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ControlReadinessResult = {
  orchestrationId: string;
  verdict: ControlReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: ControlReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type ControlRegistryManifest = {
  controlPlaneId: typeof LAUNCH_CONTROL_PLANE_ID;
  version: typeof LAUNCH_CONTROL_PLANE_VERSION;
  freezeVersion: typeof LAUNCH_CONTROL_PLANE_FREEZE_VERSION;
  base: typeof LAUNCH_CONTROL_PLANE_BASE;
  orchestrationCount: number;
  decisionCount: number;
  goNoGoCount: number;
};
