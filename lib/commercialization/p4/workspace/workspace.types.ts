/**
 * Commercialization P4 — Workspace types
 */

import type { WORKSPACE_STATUSES } from "../onboarding/onboarding.constants";

export type WorkspaceStatus = (typeof WORKSPACE_STATUSES)[number];
export type WorkspaceMetadata = Record<string, unknown>;

export type CustomerWorkspace = {
  id: string;
  accountId: string;
  name: string;
  slug: string;
  region: string;
  status: WorkspaceStatus;
  detail: string;
  metadata: WorkspaceMetadata;
  createdAt: string;
  updatedAt: string;
  setupAt?: string;
};

export type RegisterWorkspaceInput = {
  id?: string;
  accountId: string;
  name: string;
  slug: string;
  region?: string;
  metadata?: WorkspaceMetadata;
};

export type WorkspaceSetupRecord = {
  id: string;
  workspaceId: string;
  checklist: string[];
  setupScore: number;
  detail: string;
  setupAt: string;
};

export type SetupWorkspaceInput = {
  id?: string;
  workspaceId: string;
  checklist?: string[];
};
