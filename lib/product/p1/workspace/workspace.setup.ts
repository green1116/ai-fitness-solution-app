/**
 * Product P1 — Workspace setup
 */

import { WORKSPACE_STATUSES } from "../onboarding/onboarding.constants";
import { getOnboardingPlan } from "../onboarding/onboarding.registry";
import type {
  SetupWorkspaceInput,
  WorkspaceSetup,
  WorkspaceStatus,
} from "../onboarding/onboarding.types";

const workspaces = new Map<string, WorkspaceSetup>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneWorkspace(workspace: WorkspaceSetup): WorkspaceSetup {
  return { ...workspace };
}

export function setupWorkspace(input: SetupWorkspaceInput): WorkspaceSetup {
  const onboardingId = input.onboardingId.trim();
  const name = input.name.trim();
  if (!onboardingId) throw new Error("workspace.onboardingId is required");
  if (!name) throw new Error("workspace.name is required");
  if (!getOnboardingPlan(onboardingId)) {
    throw new Error(`onboarding plan not found: ${onboardingId}`);
  }

  const id = input.id?.trim() || createId("p1ws");
  if (workspaces.has(id)) {
    throw new Error(`workspace already exists: ${id}`);
  }

  const now = nowIso();
  const status = WORKSPACE_STATUSES[1];
  const workspace: WorkspaceSetup = {
    id,
    onboardingId,
    name,
    status,
    detail: `name=${name} status=${status}`,
    createdAt: now,
    updatedAt: now,
  };
  workspaces.set(id, workspace);
  return cloneWorkspace(workspace);
}

export function updateWorkspaceStatus(
  workspaceId: string,
  status: WorkspaceStatus,
): WorkspaceSetup {
  const existing = workspaces.get(workspaceId.trim());
  if (!existing) {
    throw new Error(`workspace not found: ${workspaceId}`);
  }
  if (!(WORKSPACE_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid workspace status: ${status}`);
  }
  const updated: WorkspaceSetup = {
    ...existing,
    status,
    detail: `name=${existing.name} status=${status}`,
    updatedAt: nowIso(),
  };
  workspaces.set(workspaceId.trim(), updated);
  return cloneWorkspace(updated);
}

export function getWorkspace(id: string): WorkspaceSetup | undefined {
  const workspace = workspaces.get(id.trim());
  return workspace ? cloneWorkspace(workspace) : undefined;
}

export function listWorkspaces(filter?: {
  onboardingId?: string;
}): WorkspaceSetup[] {
  let result = [...workspaces.values()];
  if (filter?.onboardingId) {
    const oid = filter.onboardingId.trim();
    result = result.filter((w) => w.onboardingId === oid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneWorkspace);
}

export function clearWorkspaces(): void {
  workspaces.clear();
}
