/**
 * Commercialization P4 — Workspace setup
 */

import {
  getCustomerWorkspace,
  markWorkspaceReady,
} from "./workspace.registry";
import type {
  SetupWorkspaceInput,
  WorkspaceSetupRecord,
} from "./workspace.types";

const setups = new Map<string, WorkspaceSetupRecord>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSetup(setup: WorkspaceSetupRecord): WorkspaceSetupRecord {
  return { ...setup, checklist: [...setup.checklist] };
}

export function setupWorkspace(
  input: SetupWorkspaceInput,
): WorkspaceSetupRecord {
  const workspaceId = input.workspaceId.trim();
  const workspace = getCustomerWorkspace(workspaceId);
  if (!workspace) throw new Error(`workspace not found: ${workspaceId}`);

  const checklist = (
    input.checklist ?? [
      "identity",
      "billing-link",
      "admin-user",
      "integrations",
    ]
  )
    .map((c) => c.trim())
    .filter(Boolean);

  if (checklist.length === 0) {
    throw new Error(`workspace setup requires checklist items`);
  }

  markWorkspaceReady(workspaceId);

  const setupScore = Math.min(100, checklist.length * 20);
  const id = input.id?.trim() || createId("wsetup");
  if (setups.has(id)) {
    throw new Error(`workspace setup already exists: ${id}`);
  }

  const setup: WorkspaceSetupRecord = {
    id,
    workspaceId,
    checklist,
    setupScore,
    detail: `items=${checklist.length} score=${setupScore}`,
    setupAt: nowIso(),
  };
  setups.set(id, setup);
  return cloneSetup(setup);
}

export function getWorkspaceSetup(
  id: string,
): WorkspaceSetupRecord | undefined {
  const setup = setups.get(id.trim());
  return setup ? cloneSetup(setup) : undefined;
}

export function listWorkspaceSetups(filter?: {
  workspaceId?: string;
}): WorkspaceSetupRecord[] {
  let result = [...setups.values()];
  if (filter?.workspaceId) {
    const wid = filter.workspaceId.trim();
    result = result.filter((s) => s.workspaceId === wid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSetup);
}

export function clearWorkspaceSetups(): void {
  setups.clear();
}
