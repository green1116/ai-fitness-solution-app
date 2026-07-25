/**
 * Product P11 — Deployment types
 */

import type { DEPLOYMENT_STATUSES } from "../release/release.constants";

export type DeploymentStatus = (typeof DEPLOYMENT_STATUSES)[number];
export type DeploymentMetadata = Record<string, unknown>;

export type ReleaseDeployment = {
  id: string;
  releaseId: string;
  environmentId: string;
  versionId: string;
  status: DeploymentStatus;
  detail: string;
  metadata: DeploymentMetadata;
  startedAt: string;
  completedAt?: string;
};

export type StartDeploymentInput = {
  id?: string;
  releaseId: string;
  environmentId: string;
  versionId: string;
  metadata?: DeploymentMetadata;
};

export type CompleteDeploymentInput = {
  deploymentId: string;
  status: "SUCCEEDED" | "FAILED" | "ROLLED_BACK";
};
