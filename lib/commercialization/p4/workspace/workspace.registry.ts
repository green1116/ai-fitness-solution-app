/**
 * Commercialization P4 — Workspace registry
 */

import { WORKSPACE_STATUSES } from "../onboarding/onboarding.constants";
import { getCustomerAccount } from "../account/account.registry";
import type {
  CustomerWorkspace,
  RegisterWorkspaceInput,
  WorkspaceStatus,
} from "./workspace.types";

const workspaces = new Map<string, CustomerWorkspace>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneWorkspace(workspace: CustomerWorkspace): CustomerWorkspace {
  return { ...workspace, metadata: { ...workspace.metadata } };
}

export function registerWorkspace(
  input: RegisterWorkspaceInput,
): CustomerWorkspace {
  const name = input.name.trim();
  const accountId = input.accountId.trim();
  const slug = input.slug.trim().toLowerCase();
  if (!name) throw new Error("workspace.name is required");
  if (!slug) throw new Error("workspace.slug is required");

  const account = getCustomerAccount(accountId);
  if (!account) throw new Error(`account not found: ${accountId}`);

  const id = input.id?.trim() || createId("ws");
  if (workspaces.has(id)) {
    throw new Error(`workspace already exists: ${id}`);
  }

  const status: WorkspaceStatus = "PENDING";
  if (!(WORKSPACE_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid workspace status: ${status}`);
  }

  const now = nowIso();
  const workspace: CustomerWorkspace = {
    id,
    accountId,
    name,
    slug,
    region: (input.region ?? "GLOBAL").trim() || "GLOBAL",
    status,
    detail: `status=${status} slug=${slug}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  workspaces.set(id, workspace);
  return cloneWorkspace(workspace);
}

export function markWorkspaceReady(id: string): CustomerWorkspace {
  const workspace = workspaces.get(id.trim());
  if (!workspace) throw new Error(`workspace not found: ${id}`);
  workspace.status = "READY";
  workspace.setupAt = nowIso();
  workspace.updatedAt = workspace.setupAt;
  workspace.detail = `status=READY slug=${workspace.slug}`;
  workspaces.set(workspace.id, workspace);
  return cloneWorkspace(workspace);
}

export function goLiveWorkspace(id: string): CustomerWorkspace {
  const workspace = workspaces.get(id.trim());
  if (!workspace) throw new Error(`workspace not found: ${id}`);
  if (workspace.status !== "READY" && workspace.status !== "LIVE") {
    throw new Error(`go-live requires READY workspace (status=${workspace.status})`);
  }
  workspace.status = "LIVE";
  workspace.updatedAt = nowIso();
  workspace.detail = `status=LIVE slug=${workspace.slug}`;
  workspaces.set(workspace.id, workspace);
  return cloneWorkspace(workspace);
}

export function getCustomerWorkspace(
  id: string,
): CustomerWorkspace | undefined {
  const workspace = workspaces.get(id.trim());
  return workspace ? cloneWorkspace(workspace) : undefined;
}

export function listCustomerWorkspaces(filter?: {
  accountId?: string;
  status?: WorkspaceStatus;
}): CustomerWorkspace[] {
  let result = [...workspaces.values()];
  if (filter?.accountId) {
    const aid = filter.accountId.trim();
    result = result.filter((w) => w.accountId === aid);
  }
  if (filter?.status) result = result.filter((w) => w.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneWorkspace);
}

export function clearCustomerWorkspaces(): void {
  workspaces.clear();
}
