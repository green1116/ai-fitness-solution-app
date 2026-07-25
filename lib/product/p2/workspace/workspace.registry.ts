/**
 * Product P2 — Workspace registry
 */

import { WORKSPACE_STATUSES } from "../organization/organization.constants";
import { getOrganization } from "../organization/organization.registry";
import type {
  OrganizationWorkspace,
  RegisterWorkspaceInput,
  UpdateWorkspaceStatusInput,
  WorkspaceStatus,
} from "./workspace.types";

const workspaces = new Map<string, OrganizationWorkspace>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneWorkspace(
  workspace: OrganizationWorkspace,
): OrganizationWorkspace {
  return { ...workspace, metadata: { ...workspace.metadata } };
}

export function registerWorkspace(
  input: RegisterWorkspaceInput,
): OrganizationWorkspace {
  const organizationId = input.organizationId.trim();
  const name = input.name.trim();
  if (!organizationId) throw new Error("workspace.organizationId is required");
  if (!name) throw new Error("workspace.name is required");
  if (!getOrganization(organizationId)) {
    throw new Error(`organization not found: ${organizationId}`);
  }

  const id = input.id?.trim() || createId("p2ws");
  if (workspaces.has(id)) {
    throw new Error(`workspace already exists: ${id}`);
  }

  const now = nowIso();
  const status = WORKSPACE_STATUSES[1];
  const workspace: OrganizationWorkspace = {
    id,
    organizationId,
    name,
    status,
    detail: `name=${name} status=${status}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  workspaces.set(id, workspace);
  return cloneWorkspace(workspace);
}

export function updateWorkspaceStatus(
  input: UpdateWorkspaceStatusInput,
): OrganizationWorkspace {
  const workspaceId = input.workspaceId.trim();
  if (!workspaceId) throw new Error("workspace.workspaceId is required");
  if (!(WORKSPACE_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid workspace status: ${input.status}`);
  }
  const existing = workspaces.get(workspaceId);
  if (!existing) throw new Error(`workspace not found: ${workspaceId}`);

  const updated: OrganizationWorkspace = {
    ...existing,
    status: input.status,
    detail: `name=${existing.name} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  workspaces.set(workspaceId, updated);
  return cloneWorkspace(updated);
}

export function getWorkspace(id: string): OrganizationWorkspace | undefined {
  const workspace = workspaces.get(id.trim());
  return workspace ? cloneWorkspace(workspace) : undefined;
}

export function listWorkspaces(filter?: {
  organizationId?: string;
  status?: WorkspaceStatus;
}): OrganizationWorkspace[] {
  let result = [...workspaces.values()];
  if (filter?.organizationId) {
    const oid = filter.organizationId.trim();
    result = result.filter((w) => w.organizationId === oid);
  }
  if (filter?.status) result = result.filter((w) => w.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneWorkspace);
}

export function clearWorkspaces(): void {
  workspaces.clear();
}
