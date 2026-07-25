/**
 * Product P2 — Workspace types
 */

import type { WORKSPACE_STATUSES } from "../organization/organization.constants";

export type WorkspaceStatus = (typeof WORKSPACE_STATUSES)[number];
export type WorkspaceMetadata = Record<string, unknown>;

export type OrganizationWorkspace = {
  id: string;
  organizationId: string;
  name: string;
  status: WorkspaceStatus;
  detail: string;
  metadata: WorkspaceMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterWorkspaceInput = {
  id?: string;
  organizationId: string;
  name: string;
  metadata?: WorkspaceMetadata;
};

export type UpdateWorkspaceStatusInput = {
  workspaceId: string;
  status: WorkspaceStatus;
};
