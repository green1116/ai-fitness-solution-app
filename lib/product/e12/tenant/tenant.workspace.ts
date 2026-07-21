/**
 * E12-P2 — Workspace Model
 */

import { WORKSPACE_STATUSES } from "./tenant.constants";
import type {
  CreateWorkspaceInput,
  ProductWorkspace,
  WorkspaceStatus,
} from "./tenant.types";

const workspaces = new Map<string, ProductWorkspace>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneWorkspace(workspace: ProductWorkspace): ProductWorkspace {
  return { ...workspace, metadata: { ...workspace.metadata } };
}

export function createWorkspace(input: CreateWorkspaceInput): ProductWorkspace {
  const name = input.name.trim();
  const slug = input.slug.trim().toLowerCase();
  if (!name) throw new Error("workspace.name is required");
  if (!slug) throw new Error("workspace.slug is required");

  const status = input.status ?? "ACTIVE";
  if (!(WORKSPACE_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid workspace status: ${status}`);
  }

  const id = input.id?.trim() || createId("ws");
  if (workspaces.has(id)) throw new Error(`workspace already exists: ${id}`);

  for (const ws of workspaces.values()) {
    if (ws.slug === slug) {
      throw new Error(`workspace slug already taken: ${slug}`);
    }
  }

  const workspace: ProductWorkspace = {
    id,
    name,
    slug,
    status,
    productTenantId: input.productTenantId?.trim() || undefined,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  workspaces.set(id, workspace);
  return cloneWorkspace(workspace);
}

export function getWorkspace(id: string): ProductWorkspace | undefined {
  const workspace = workspaces.get(id.trim());
  return workspace ? cloneWorkspace(workspace) : undefined;
}

export function getWorkspaceBySlug(
  slug: string,
): ProductWorkspace | undefined {
  const key = slug.trim().toLowerCase();
  for (const workspace of workspaces.values()) {
    if (workspace.slug === key) return cloneWorkspace(workspace);
  }
  return undefined;
}

export function listWorkspaces(filter?: {
  status?: WorkspaceStatus;
}): ProductWorkspace[] {
  let result = [...workspaces.values()];
  if (filter?.status) {
    result = result.filter((w) => w.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneWorkspace);
}

export function bindWorkspaceToTenant(
  workspaceId: string,
  productTenantId: string,
): ProductWorkspace {
  const workspace = workspaces.get(workspaceId.trim());
  if (!workspace) throw new Error(`workspace not found: ${workspaceId}`);
  workspace.productTenantId = productTenantId.trim();
  workspaces.set(workspace.id, workspace);
  return cloneWorkspace(workspace);
}

export function clearWorkspaces(): void {
  workspaces.clear();
}
