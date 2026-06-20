import type { WorkspaceBusinessEntry, WorkspaceBusinessEntryRegistry } from "./workspace-business-entry-types";

const workspaceBusinessEntryRegistry = new Map<string, WorkspaceBusinessEntry>();

export function registerWorkspaceBusinessEntry(entry: WorkspaceBusinessEntry): WorkspaceBusinessEntryRegistry {
  const registeredEntry: WorkspaceBusinessEntry = {
    scope: { ...entry.scope },
    status: entry.status,
    domainState: entry.domainState,
    orchestrationState: entry.orchestrationState,
    entryState: entry.entryState,
  };
  workspaceBusinessEntryRegistry.set(entry.scope.workspaceId, registeredEntry);
  return {
    workspaceId: entry.scope.workspaceId,
    entry: registeredEntry,
  };
}

export function resolveWorkspaceBusinessEntry(workspaceId: string): WorkspaceBusinessEntry | undefined {
  return workspaceBusinessEntryRegistry.get(workspaceId.trim());
}

export function hasWorkspaceBusinessEntry(workspaceId: string): boolean {
  return workspaceBusinessEntryRegistry.has(workspaceId.trim());
}

export function clearWorkspaceBusinessEntryRegistry(): void {
  workspaceBusinessEntryRegistry.clear();
}
