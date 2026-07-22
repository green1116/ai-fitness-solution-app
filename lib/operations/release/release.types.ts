/**
 * Post-Launch P4 — Release Management Operations types
 */

import type {
  DEPLOYMENT_APPROVAL_STATUSES,
  OPERATIONS_RELEASE_MANAGEMENT_BASE,
  OPERATIONS_RELEASE_MANAGEMENT_FREEZE_VERSION,
  OPERATIONS_RELEASE_MANAGEMENT_ID,
  OPERATIONS_RELEASE_MANAGEMENT_VERSION,
  RELEASE_LIFECYCLE_STATUSES,
  RELEASE_MANAGER_STATUSES,
  RELEASE_READINESS_VERDICTS,
  RELEASE_VERSION_KINDS,
  ROLLBACK_STEP_STATUSES,
  ROLLBACK_WORKFLOW_STEPS,
} from "./release.constants";

export type ReleaseLifecycleStatus =
  (typeof RELEASE_LIFECYCLE_STATUSES)[number];
export type ReleaseVersionKind = (typeof RELEASE_VERSION_KINDS)[number];
export type DeploymentApprovalStatus =
  (typeof DEPLOYMENT_APPROVAL_STATUSES)[number];
export type RollbackWorkflowStep = (typeof ROLLBACK_WORKFLOW_STEPS)[number];
export type RollbackStepStatus = (typeof ROLLBACK_STEP_STATUSES)[number];
export type ReleaseReadinessVerdict =
  (typeof RELEASE_READINESS_VERDICTS)[number];
export type ReleaseManagerStatus = (typeof RELEASE_MANAGER_STATUSES)[number];

export type ReleaseMetadata = Record<string, unknown>;

/** Release lifecycle. */
export type OperationsRelease = {
  id: string;
  name: string;
  productId: string;
  productionOperationId: string;
  orchestrationId: string;
  deploymentPackageId: string;
  versionRecordId?: string;
  approvalId?: string;
  status: ReleaseLifecycleStatus;
  detail: string;
  metadata: ReleaseMetadata;
  createdAt: string;
  updatedAt: string;
  releasedAt?: string;
  rolledBackAt?: string;
};

export type CreateOperationsReleaseInput = {
  id?: string;
  name: string;
  productId: string;
  productionOperationId: string;
  orchestrationId: string;
  deploymentPackageId: string;
  detail?: string;
  metadata?: ReleaseMetadata;
};

/** Version tracking. */
export type ReleaseVersionRecord = {
  id: string;
  operationsReleaseId: string;
  version: string;
  kind: ReleaseVersionKind;
  previousVersion?: string;
  deploymentPackageId: string;
  detail: string;
  recordedAt: string;
};

export type TrackReleaseVersionInput = {
  id?: string;
  operationsReleaseId: string;
  version: string;
  kind: ReleaseVersionKind;
  previousVersion?: string;
  detail?: string;
};

/** Deployment approval. */
export type DeploymentApproval = {
  id: string;
  operationsReleaseId: string;
  status: DeploymentApprovalStatus;
  approver: string;
  detail: string;
  openIncidentBlockers: number;
  approvedAt?: string;
  rejectedAt?: string;
  createdAt: string;
};

export type RequestDeploymentApprovalInput = {
  id?: string;
  operationsReleaseId: string;
  approver: string;
  detail?: string;
};

export type DecideDeploymentApprovalInput = {
  approvalId: string;
  approve: boolean;
  detail?: string;
};

/** Rollback workflow. */
export type RollbackStepRecord = {
  step: RollbackWorkflowStep;
  status: RollbackStepStatus;
  detail: string;
  completedAt?: string;
};

export type RollbackWorkflow = {
  id: string;
  operationsReleaseId: string;
  targetVersion?: string;
  steps: RollbackStepRecord[];
  currentStep?: RollbackWorkflowStep;
  complete: boolean;
  failed: boolean;
  updatedAt: string;
};

export type StartRollbackWorkflowInput = {
  id?: string;
  operationsReleaseId: string;
  targetVersion?: string;
  reason?: string;
};

/** Release metrics. */
export type ReleaseMetrics = {
  productionOperationId?: string;
  releaseCount: number;
  approvedCount: number;
  releasedCount: number;
  rolledBackCount: number;
  failedCount: number;
  pendingApprovalCount: number;
  rollbackCompleteRate: number;
  releaseSuccessScore: number;
  computedAt: string;
};

/** Readiness. */
export type ReleaseReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ReleaseReadinessResult = {
  operationsReleaseId: string;
  verdict: ReleaseReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: ReleaseReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type ReleaseRegistryManifest = {
  releaseManagementId: typeof OPERATIONS_RELEASE_MANAGEMENT_ID;
  version: typeof OPERATIONS_RELEASE_MANAGEMENT_VERSION;
  freezeVersion: typeof OPERATIONS_RELEASE_MANAGEMENT_FREEZE_VERSION;
  base: typeof OPERATIONS_RELEASE_MANAGEMENT_BASE;
  releaseCount: number;
  versionCount: number;
  approvalCount: number;
  rollbackCount: number;
};
