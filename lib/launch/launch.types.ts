/**
 * Launch P1 — Production Deployment Foundation types
 */

import type {
  DEPLOYMENT_READINESS_VERDICTS,
  LAUNCH_MANAGER_STATUSES,
  LAUNCH_PRODUCTION_FOUNDATION_BASE,
  LAUNCH_PRODUCTION_FOUNDATION_FREEZE_VERSION,
  LAUNCH_PRODUCTION_FOUNDATION_ID,
  LAUNCH_PRODUCTION_FOUNDATION_VERSION,
  PRODUCTION_ARTIFACT_KINDS,
  PRODUCTION_ARTIFACT_STATUSES,
  PRODUCTION_PROFILE_STATUSES,
  RELEASE_CHECKLIST_ITEM_STATUSES,
} from "./launch.constants";

export type ProductionProfileStatus =
  (typeof PRODUCTION_PROFILE_STATUSES)[number];
export type ReleaseChecklistItemStatus =
  (typeof RELEASE_CHECKLIST_ITEM_STATUSES)[number];
export type DeploymentReadinessVerdict =
  (typeof DEPLOYMENT_READINESS_VERDICTS)[number];
export type ProductionArtifactKind = (typeof PRODUCTION_ARTIFACT_KINDS)[number];
export type ProductionArtifactStatus =
  (typeof PRODUCTION_ARTIFACT_STATUSES)[number];
export type LaunchManagerStatus = (typeof LAUNCH_MANAGER_STATUSES)[number];

export type LaunchMetadata = Record<string, unknown>;

/** Production profile. */
export type ProductionProfile = {
  id: string;
  name: string;
  region: string;
  status: ProductionProfileStatus;
  productId: string;
  deploymentPackageId?: string;
  platformBaseline: string;
  productizationCompleteId: string;
  metadata: LaunchMetadata;
  createdAt: string;
};

export type CreateProductionProfileInput = {
  id?: string;
  name: string;
  region?: string;
  status?: ProductionProfileStatus;
  productId: string;
  deploymentPackageId?: string;
  metadata?: LaunchMetadata;
};

/** Release checklist. */
export type ReleaseChecklistItem = {
  id: string;
  key: string;
  label: string;
  status: ReleaseChecklistItemStatus;
  required: boolean;
  detail: string;
};

export type ReleaseChecklist = {
  id: string;
  productionProfileId: string;
  items: ReleaseChecklistItem[];
  passCount: number;
  failCount: number;
  pendingCount: number;
  complete: boolean;
  updatedAt: string;
};

export type SetChecklistItemStatusInput = {
  checklistId: string;
  itemKey: string;
  status: ReleaseChecklistItemStatus;
  detail?: string;
};

/** Deployment readiness model. */
export type DeploymentReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type DeploymentReadinessResult = {
  productionProfileId: string;
  verdict: DeploymentReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: DeploymentReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

/** Production artifact registry. */
export type ProductionArtifact = {
  id: string;
  productionProfileId: string;
  kind: ProductionArtifactKind;
  refId: string;
  checksum?: string;
  status: ProductionArtifactStatus;
  uri: string;
  metadata: LaunchMetadata;
  registeredAt: string;
};

export type RegisterProductionArtifactInput = {
  id?: string;
  productionProfileId: string;
  kind: ProductionArtifactKind;
  refId: string;
  checksum?: string;
  status?: ProductionArtifactStatus;
  uri?: string;
  metadata?: LaunchMetadata;
};

/** Launch manifest. */
export type LaunchManifest = {
  launchId: typeof LAUNCH_PRODUCTION_FOUNDATION_ID;
  version: typeof LAUNCH_PRODUCTION_FOUNDATION_VERSION;
  freezeVersion: typeof LAUNCH_PRODUCTION_FOUNDATION_FREEZE_VERSION;
  base: typeof LAUNCH_PRODUCTION_FOUNDATION_BASE;
  productionProfileId: string;
  productId: string;
  platformAligned: boolean;
  productFoundationReady: boolean;
  productizationCompleteId: string;
  deploymentPackageId?: string;
  checklistComplete: boolean;
  readinessVerdict: DeploymentReadinessVerdict;
  artifactCount: number;
  ready: boolean;
  summary: string;
  generatedAt: string;
};

export type LaunchRegistryManifest = {
  launchId: typeof LAUNCH_PRODUCTION_FOUNDATION_ID;
  version: typeof LAUNCH_PRODUCTION_FOUNDATION_VERSION;
  freezeVersion: typeof LAUNCH_PRODUCTION_FOUNDATION_FREEZE_VERSION;
  base: typeof LAUNCH_PRODUCTION_FOUNDATION_BASE;
  profileCount: number;
  checklistCount: number;
  artifactCount: number;
};
