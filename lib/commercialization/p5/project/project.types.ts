/**
 * Commercialization P5 — Project types
 */

import type { PROJECT_STATUSES } from "../delivery/delivery.constants";

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type ProjectMetadata = Record<string, unknown>;

export type DeliveryProject = {
  id: string;
  name: string;
  accountRef: string;
  workspaceRef: string;
  owner: string;
  status: ProjectStatus;
  detail: string;
  metadata: ProjectMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterProjectInput = {
  id?: string;
  name: string;
  accountRef: string;
  workspaceRef: string;
  owner?: string;
  status?: ProjectStatus;
  metadata?: ProjectMetadata;
};

export type ProjectLifecycleRecord = {
  id: string;
  projectId: string;
  status: ProjectStatus;
  previousStatus?: ProjectStatus;
  reason: string;
  transitionedAt: string;
};

export type TransitionProjectInput = {
  id?: string;
  projectId: string;
  status: ProjectStatus;
  reason?: string;
};
