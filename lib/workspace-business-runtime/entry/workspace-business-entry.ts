import type { BusinessStatus, BusinessScope } from "../context/workspace-business-context-types";
import type { WorkspaceBusinessOrchestration } from "../orchestration/workspace-business-orchestration-types";
import type { BusinessEntryState, WorkspaceBusinessEntry } from "./workspace-business-entry-types";

export function resolveBusinessEntryStatus(orchestration: WorkspaceBusinessOrchestration): BusinessStatus {
  return orchestration.status;
}

export function resolveBusinessEntryState(
  orchestration: WorkspaceBusinessOrchestration,
): BusinessEntryState {
  if (orchestration.status === "BLOCKED") {
    return "DISABLED";
  }
  switch (orchestration.orchestrationState) {
    case "READY":
      return "ACTIVE";
    case "LIMITED":
    case "IDLE":
    default:
      return "DRAFT";
  }
}

export function describeWorkspaceBusinessEntry(entry: WorkspaceBusinessEntry): string {
  return [
    `workspaceId=${entry.scope.workspaceId}`,
    `version=${entry.scope.version}`,
    `status=${entry.status}`,
    `domainState=${entry.domainState}`,
    `orchestrationState=${entry.orchestrationState}`,
    `entryState=${entry.entryState}`,
  ].join(" ");
}

export function assertBusinessEntryScope(scope: BusinessScope): boolean {
  return scope.workspaceId.trim().length > 0 && scope.version.trim().length > 0;
}

export function assertWorkspaceBusinessEntryShape(entry: WorkspaceBusinessEntry): boolean {
  if (!assertBusinessEntryScope(entry.scope)) {
    return false;
  }
  if (!["READY", "PARTIAL", "BLOCKED"].includes(entry.status)) {
    return false;
  }
  if (!["INITIALIZING", "ACTIVE", "LIMITED"].includes(entry.domainState)) {
    return false;
  }
  if (!["IDLE", "READY", "LIMITED"].includes(entry.orchestrationState)) {
    return false;
  }
  if (!["DRAFT", "ACTIVE", "DISABLED"].includes(entry.entryState)) {
    return false;
  }
  return true;
}
